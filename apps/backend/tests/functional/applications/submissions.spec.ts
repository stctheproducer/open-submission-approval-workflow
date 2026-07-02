import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'

test.group('Application submissions', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('rejects unauthenticated requests to submit an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.create()

    const response = await client
      .visit('applicant.applications.submissions.store', { application_id: application.id })
      .json({})

    response.assertStatus(401)
  })

  test('submits an owned draft application and returns the submitted detail with the first history entry (200)', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.DRAFT,
    }).create()

    const response = await client
      .visit('applicant.applications.submissions.store', { application_id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json({})

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: application.id,
        status: ApplicationStatus.SUBMITTED,
      },
    })

    const body = response.body() as any
    if (!Array.isArray(body.data.history) || body.data.history.length === 0) {
      throw new Error(`Expected a history entry, got ${JSON.stringify(body.data.history)}`)
    }
    if (
      body.data.history[0].previousStatus !== ApplicationStatus.DRAFT ||
      body.data.history[0].nextStatus !== ApplicationStatus.SUBMITTED
    ) {
      throw new Error(`Expected submission history entry, got ${JSON.stringify(body.data.history)}`)
    }

    await db.assertHas('applications', { id: application.id, status: ApplicationStatus.SUBMITTED })
    await db.assertHas('application_audit_log_entries', {
      application_id: application.id,
      actor_user_id: applicant.id,
      previous_status: ApplicationStatus.DRAFT,
      next_status: ApplicationStatus.SUBMITTED,
    })
  })

  test('returns 404 when submitting a foreign or non-existent application', async ({ client }) => {
    const applicant = await UserFactory.create()
    const otherApplicant = await UserFactory.create()
    const foreignApplication = await ApplicationFactory.merge({
      userId: otherApplicant.id,
    }).create()

    const foreignResponse = await client
      .visit('applicant.applications.submissions.store', { application_id: foreignApplication.id })
      .withGuard('web')
      .loginAs(applicant)
      .json({})
    foreignResponse.assertStatus(404)

    const missingResponse = await client
      .visit('applicant.applications.submissions.store', { application_id: 999999 })
      .withGuard('web')
      .loginAs(applicant)
      .json({})
    missingResponse.assertStatus(404)
  })

  test('rejects submission of a non-draft application with a conflict error (409)', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
    }).create()

    const response = await client
      .visit('applicant.applications.submissions.store', { application_id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json({})

    response.assertStatus(409)
    await db.assertHas('applications', { id: application.id, status: ApplicationStatus.SUBMITTED })
  })
})
