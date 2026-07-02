import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'
import { ApplicationAuditEntryFactory } from '#database/factories/application_audit_entry_factory'

async function createApplicant() {
  const applicant = await UserFactory.create()
  applicant.role = 'applicant'
  await User.query().where('id', applicant.id).update({ role: 'applicant' })
  return applicant
}

test.group('Application draft reopenings', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('reopens an eligible changes-requested application and returns the updated summary (200)', async ({
    client,
    db,
  }) => {
    const applicant = await createApplicant()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.CHANGES_REQUESTED,
    }).create()
    await ApplicationAuditEntryFactory.merge({
      applicationId: application.id,
      actorId: applicant.id,
      fromStatus: ApplicationStatus.UNDER_REVIEW,
      toStatus: ApplicationStatus.CHANGES_REQUESTED,
      comment: 'Please update the budget section',
    }).create()

    const response = await client
      .visit('applicant.application_draft_reopenings.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(200)
    response.assertBodyContains({
      application: {
        id: application.id,
        status: ApplicationStatus.DRAFT,
      },
    })
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.DRAFT,
    })
    await db.assertHas('application_audit_entries', {
      application_id: application.id,
      actor_id: applicant.id,
      from_status: ApplicationStatus.CHANGES_REQUESTED,
      to_status: ApplicationStatus.DRAFT,
    })
  })

  test('rejects unauthenticated requests to reopen an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.merge({
      status: ApplicationStatus.CHANGES_REQUESTED,
    }).create()

    const response = await client.visit('applicant.application_draft_reopenings.store', {
      id: application.id,
    })

    response.assertStatus(401)
  })

  test('rejects a non-owner applicant from reopening an application (403)', async ({ client }) => {
    const nonOwnerApplicant = await createApplicant()
    const ownerApplicant = await createApplicant()
    const application = await ApplicationFactory.merge({
      userId: ownerApplicant.id,
      status: ApplicationStatus.CHANGES_REQUESTED,
    }).create()

    const response = await client
      .visit('applicant.application_draft_reopenings.store', { id: application.id })
      .withGuard('web')
      .loginAs(nonOwnerApplicant)

    response.assertStatus(403)
  })

  test('rejects reopening a non-eligible application with a conflict error (409)', async ({
    client,
    db,
  }) => {
    const applicant = await createApplicant()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
    }).create()

    const response = await client
      .visit('applicant.application_draft_reopenings.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(409)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.UNDER_REVIEW,
    })
  })

  test('returns 404 for a non-existent application', async ({ client }) => {
    const applicant = await createApplicant()
    const response = await client
      .visit('applicant.application_draft_reopenings.store', { id: 999999 })
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(404)
  })
})
