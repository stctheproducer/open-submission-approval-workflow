import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'
import { ApplicationStatusTransitionFactory } from '#database/factories/application_status_transition_factory'
import { assertProblemDetails } from './problem_details.js'

test.group('Application submissions', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects unauthenticated requests to submit an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.create()

    const response = await client
      .visit('applicant.applications.submissions.store', { application_id: application.id })
      .json({})

    response.assertStatus(401)
    assertProblemDetails(response.body(), 401)
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
    if (body.data.history[0].actor?.id !== applicant.id) {
      throw new Error(
        `Expected submission actor to be preloaded, got ${JSON.stringify(body.data.history)}`
      )
    }

    await db.assertHas('applications', { id: application.id, status: ApplicationStatus.SUBMITTED })
    await db.assertHas('application_status_transitions', {
      application_id: application.id,
      actor_user_id: applicant.id,
      previous_status: ApplicationStatus.DRAFT,
      next_status: ApplicationStatus.SUBMITTED,
    })
  })

  test('submits a reopened draft application and returns a distinct revision-round history entry (200)', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.CHANGES_REQUESTED,
    }).create()

    await ApplicationStatusTransitionFactory.merge({
      applicationId: application.id,
      actorUserId: applicant.id,
      previousStatus: ApplicationStatus.DRAFT,
      nextStatus: ApplicationStatus.SUBMITTED,
      comment: null,
    }).create()

    await ApplicationStatusTransitionFactory.merge({
      applicationId: application.id,
      actorUserId: applicant.id,
      previousStatus: ApplicationStatus.SUBMITTED,
      nextStatus: ApplicationStatus.CHANGES_REQUESTED,
      comment: 'Please update the budget section',
    }).create()

    const reopenResponse = await client
      .visit('applicant.application_draft_reopenings.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)

    reopenResponse.assertStatus(200)

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
    if (!Array.isArray(body.data.history) || body.data.history.length < 2) {
      throw new Error(`Expected revision history entries, got ${JSON.stringify(body.data.history)}`)
    }

    const submissionEntry = body.data.history.find(
      (entry: { previousStatus: string; nextStatus: string }) =>
        entry.previousStatus === ApplicationStatus.DRAFT &&
        entry.nextStatus === ApplicationStatus.SUBMITTED
    )
    if (!submissionEntry) {
      throw new Error(
        `Expected revision-round submission history entry, got ${JSON.stringify(body.data.history)}`
      )
    }
    if (submissionEntry.actor?.id !== applicant.id) {
      throw new Error(
        `Expected revision-round actor to be preloaded, got ${JSON.stringify(submissionEntry)}`
      )
    }

    await db.assertHas('applications', { id: application.id, status: ApplicationStatus.SUBMITTED })
    await db.assertHas('application_status_transitions', {
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
    assertProblemDetails(foreignResponse.body(), 404)

    const missingResponse = await client
      .visit('applicant.applications.submissions.store', { application_id: 999999 })
      .withGuard('web')
      .loginAs(applicant)
      .json({})
    missingResponse.assertStatus(404)
    assertProblemDetails(missingResponse.body(), 404)
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
    assertProblemDetails(response.body(), 409)
    await db.assertHas('applications', { id: application.id, status: ApplicationStatus.SUBMITTED })
  })
})
