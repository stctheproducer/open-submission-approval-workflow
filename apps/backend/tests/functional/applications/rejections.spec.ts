import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'
import { ApplicationStatusTransitionFactory } from '#database/factories/application_status_transition_factory'
import { assertProblemDetails } from './problem_details.js'

async function createReviewer() {
  const reviewer = await UserFactory.create()
  reviewer.role = 'reviewer'
  await User.query().where('id', reviewer.id).update({ role: 'reviewer' })
  return reviewer
}

test.group('Application rejections', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects unauthenticated requests to reject an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.merge({
      status: ApplicationStatus.UNDER_REVIEW,
    }).create()

    const response = await client
      .post(`/api/v1/reviewer/applications/${application.id}/rejections`)
      .json({ comment: 'Does not meet requirements' })

    response.assertStatus(401)
    assertProblemDetails(response.body(), 401)
  })

  test('rejects non-reviewer users from rejecting an application (403)', async ({ client }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      status: ApplicationStatus.UNDER_REVIEW,
    }).create()

    const response = await client
      .post(`/api/v1/reviewer/applications/${application.id}/rejections`)
      .withGuard('web')
      .loginAs(applicant)
      .json({ comment: 'Does not meet requirements' })

    response.assertStatus(403)
    assertProblemDetails(response.body(), 403)
  })

  test('rejects an unassigned reviewer from rejecting an application (403)', async ({
    client,
    db,
  }) => {
    const reviewer = await createReviewer()
    const assignedReviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: assignedReviewer.id,
    }).create()

    const response = await client
      .post(`/api/v1/reviewer/applications/${application.id}/rejections`)
      .withGuard('web')
      .loginAs(reviewer)
      .json({ comment: 'Does not meet requirements' })

    response.assertStatus(403)
    assertProblemDetails(response.body(), 403)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assigned_reviewer_id: assignedReviewer.id,
    })
  })

  test('rejects an eligible under-review application with a comment and returns the updated detail with history (200)', async ({
    client,
    db,
  }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
      title: 'Needs work',
      category: 'Operations',
      description: 'Needs rejection comment',
      amount: '4200.00',
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: application.id,
      actorUserId: reviewer.id,
      previousStatus: ApplicationStatus.SUBMITTED,
      nextStatus: ApplicationStatus.UNDER_REVIEW,
      comment: 'Initial review start',
    }).create()

    const response = await client
      .post(`/api/v1/reviewer/applications/${application.id}/rejections`)
      .withGuard('web')
      .loginAs(reviewer)
      .json({ comment: 'Does not meet requirements' })

    response.assertStatus(200)
    const body = response.body() as any
    if (body.data.status !== ApplicationStatus.REJECTED || body.data.reviewer?.id !== reviewer.id) {
      throw new Error(`Expected rejected detailed response, got ${JSON.stringify(body.data)}`)
    }
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.REJECTED,
      assigned_reviewer_id: reviewer.id,
    })
    await db.assertHas('application_status_transitions', {
      application_id: application.id,
      actor_user_id: reviewer.id,
      previous_status: ApplicationStatus.UNDER_REVIEW,
      next_status: ApplicationStatus.REJECTED,
      comment: 'Does not meet requirements',
    })
  })

  test('rejects a missing or blank comment with field-level validation errors (422)', async ({
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

    const rows = [{ body: {} }, { body: { comment: '   ' } }]

    for (const row of rows) {
      const response = await client
        .post(`/api/v1/reviewer/applications/${application.id}/rejections`)
        .withGuard('web')
        .loginAs(reviewer)
        .json(row.body as any)

      response.assertStatus(422)
      assertProblemDetails(response.body(), 422, { validation: true })
    }

    await db.assertMissing('application_status_transitions', { application_id: application.id })
  })

  test('rejects a non-eligible application with a conflict error (409)', async ({ client, db }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.APPROVED,
      assignedReviewerId: reviewer.id,
    }).create()

    const response = await client
      .post(`/api/v1/reviewer/applications/${application.id}/rejections`)
      .withGuard('web')
      .loginAs(reviewer)
      .json({ comment: 'Does not meet requirements' })

    response.assertStatus(409)
    assertProblemDetails(response.body(), 409)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.APPROVED,
    })
  })
})
