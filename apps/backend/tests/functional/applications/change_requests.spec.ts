import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'
import { ApplicationAuditEntryFactory } from '#database/factories/application_audit_entry_factory'

async function createReviewer() {
  const reviewer = await UserFactory.create()
  reviewer.role = 'reviewer'
  await User.query().where('id', reviewer.id).update({ role: 'reviewer' })
  return reviewer
}

test.group('Application change requests', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects unauthenticated requests to request changes (401)', async ({ client }) => {
    const application = await ApplicationFactory.merge({
      status: ApplicationStatus.UNDER_REVIEW,
    }).create()

    const response = await client
      .visit('reviewer.application_change_requests.store', {
        id: application.id,
      })
      .json({ comment: 'Please update the budget section' })

    response.assertStatus(401)
  })

  test('rejects non-reviewer users from requesting changes (403)', async ({ client }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      status: ApplicationStatus.UNDER_REVIEW,
    }).create()

    const response = await client
      .visit('reviewer.application_change_requests.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json({ comment: 'Please update the budget section' })

    response.assertStatus(403)
  })

  test('rejects an unassigned reviewer from requesting changes (403)', async ({ client, db }) => {
    const reviewer = await createReviewer()
    const assignedReviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: assignedReviewer.id,
    }).create()

    const response = await client
      .visit('reviewer.application_change_requests.store', { id: application.id })
      .withGuard('web')
      .loginAs(reviewer)
      .json({ comment: 'Please update the budget section' })

    response.assertStatus(403)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assigned_reviewer_id: assignedReviewer.id,
    })
  })

  test('rejects invalid comment payloads with field-level validation errors (422)', async ({
    client,
    db,
  }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
    }).create()

    const rows = [
      { body: {}, label: 'missing' },
      { body: { comment: '   ' }, label: 'blank' },
      { body: { comment: 'x'.repeat(2001) }, label: 'too-long' },
    ]

    for (const row of rows) {
      const response = await client
        .visit('reviewer.application_change_requests.store', { id: application.id })
        .withGuard('web')
        .loginAs(reviewer)
        .json(row.body as any)

      response.assertStatus(422)
      const body = response.body() as any
      if (!Array.isArray(body.errors) || body.errors.length === 0) {
        throw new Error(`Expected validation errors for ${row.label}, got ${JSON.stringify(body)}`)
      }
    }

    await db.assertMissing('application_audit_entries', { application_id: application.id })
  })

  test('requests change on an eligible under-review application and returns the updated summary (200)', async ({
    client,
    db,
  }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
    }).create()
    await ApplicationAuditEntryFactory.merge({
      applicationId: application.id,
      actorId: reviewer.id,
      fromStatus: ApplicationStatus.SUBMITTED,
      toStatus: ApplicationStatus.UNDER_REVIEW,
      comment: 'Initial review start',
    }).create()

    const response = await client
      .visit('reviewer.application_change_requests.store', { id: application.id })
      .withGuard('web')
      .loginAs(reviewer)
      .json({ comment: 'Please update the budget section' })

    response.assertStatus(200)
    response.assertBodyContains({
      application: {
        id: application.id,
        status: ApplicationStatus.CHANGES_REQUESTED,
      },
    })
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.CHANGES_REQUESTED,
    })
    await db.assertHas('application_audit_entries', {
      application_id: application.id,
      actor_id: reviewer.id,
      from_status: ApplicationStatus.UNDER_REVIEW,
      to_status: ApplicationStatus.CHANGES_REQUESTED,
      comment: 'Please update the budget section',
    })
  })

  test('rejects a change request on a non-eligible application with a conflict error (409)', async ({
    client,
    db,
  }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.APPROVED,
      assignedReviewerId: reviewer.id,
    }).create()

    const response = await client
      .visit('reviewer.application_change_requests.store', { id: application.id })
      .withGuard('web')
      .loginAs(reviewer)
      .json({ comment: 'Please update the budget section' })

    response.assertStatus(409)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.APPROVED,
    })
  })

  test('returns 404 for a non-existent application', async ({ client }) => {
    const reviewer = await createReviewer()
    const response = await client
      .visit('reviewer.application_change_requests.store', { id: 999999 })
      .withGuard('web')
      .loginAs(reviewer)
      .json({ comment: 'Please update the budget section' })

    response.assertStatus(404)
  })
})
