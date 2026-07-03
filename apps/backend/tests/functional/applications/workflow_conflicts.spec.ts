import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'
import { ApplicationStatusTransitionFactory } from '#database/factories/application_status_transition_factory'
import { assertProblemDetails } from './problem_details.js'

async function createApplicant() {
  const applicant = await UserFactory.create()
  applicant.role = 'applicant'
  await User.query().where('id', applicant.id).update({ role: 'applicant' })
  return applicant
}

async function createReviewer() {
  const reviewer = await UserFactory.create()
  reviewer.role = 'reviewer'
  await User.query().where('id', reviewer.id).update({ role: 'reviewer' })
  return reviewer
}

test.group('Workflow conflicts', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects stale workflow transitions with a consistent 409 conflict response across all main routes', async ({
    client,
    db,
  }) => {
    const applicant = await createApplicant()
    const reviewer = await createReviewer()

    const submission = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
    }).create()
    const reviewStart = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
    }).create()
    const approval = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.APPROVED,
      assignedReviewerId: reviewer.id,
    }).create()
    const rejection = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.REJECTED,
      assignedReviewerId: reviewer.id,
    }).create()
    const changeRequest = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.CHANGES_REQUESTED,
      assignedReviewerId: reviewer.id,
    }).create()
    const reopen = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.DRAFT,
    }).create()

    await ApplicationStatusTransitionFactory.merge({
      applicationId: reviewStart.id,
      actorUserId: reviewer.id,
      previousStatus: ApplicationStatus.SUBMITTED,
      nextStatus: ApplicationStatus.UNDER_REVIEW,
      comment: 'Started review',
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: approval.id,
      actorUserId: reviewer.id,
      previousStatus: ApplicationStatus.UNDER_REVIEW,
      nextStatus: ApplicationStatus.APPROVED,
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: rejection.id,
      actorUserId: reviewer.id,
      previousStatus: ApplicationStatus.UNDER_REVIEW,
      nextStatus: ApplicationStatus.REJECTED,
      comment: 'Rejected already',
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: changeRequest.id,
      actorUserId: reviewer.id,
      previousStatus: ApplicationStatus.UNDER_REVIEW,
      nextStatus: ApplicationStatus.CHANGES_REQUESTED,
      comment: 'Change already',
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: reopen.id,
      actorUserId: applicant.id,
      previousStatus: ApplicationStatus.CHANGES_REQUESTED,
      nextStatus: ApplicationStatus.DRAFT,
      comment: 'Reopened already',
    }).create()

    const cases = [
      {
        path: `/api/v1/applicant/applications/${submission.id}/submissions`,
        actor: applicant,
        body: {},
        status: ApplicationStatus.SUBMITTED,
        table: 'application_status_transitions',
        assertNoAudit: async () => {
          await db.assertMissing('application_status_transitions', {
            application_id: submission.id,
          })
        },
      },
      {
        path: `/api/v1/reviewer/applications/${reviewStart.id}/review-starts`,
        actor: reviewer,
        body: {},
        status: ApplicationStatus.UNDER_REVIEW,
        table: 'application_status_transitions',
        assertNoAudit: async () => {
          await db.assertHas('application_status_transitions', {
            application_id: reviewStart.id,
          })
          await db.assertMissing('application_status_transitions', {
            application_id: reviewStart.id,
            comment: null,
          })
        },
      },
      {
        path: `/api/v1/reviewer/applications/${approval.id}/approvals`,
        actor: reviewer,
        body: {},
        status: ApplicationStatus.APPROVED,
        table: 'application_status_transitions',
        assertNoAudit: async () => {
          await db.assertHas('application_status_transitions', {
            application_id: approval.id,
            next_status: ApplicationStatus.APPROVED,
          })
        },
      },
      {
        path: `/api/v1/reviewer/applications/${rejection.id}/rejections`,
        actor: reviewer,
        body: { comment: 'Does not meet requirements' },
        status: ApplicationStatus.REJECTED,
        table: 'application_status_transitions',
      },
      {
        path: `/api/v1/reviewer/applications/${changeRequest.id}/change-request`,
        actor: reviewer,
        body: { comment: 'Please update the budget section' },
        status: ApplicationStatus.CHANGES_REQUESTED,
        table: 'application_status_transitions',
      },
      {
        path: `/api/v1/applicant/applications/${reopen.id}/reopen`,
        actor: applicant,
        body: {},
        status: ApplicationStatus.DRAFT,
        table: 'application_status_transitions',
      },
    ] as const

    for (const row of cases) {
      const response = await client
        .post(row.path)
        .withGuard('web')
        .loginAs(row.actor)
        .json(row.body as any)

      response.assertStatus(409)
      assertProblemDetails(response.body(), 409)

      await db.assertHas('applications', {
        id: Number(row.path.match(/applications\/(\d+)/)?.[1]),
        status: row.status,
      })
    }
  })

  test('conflict response envelope matches the same shape used by validation, authorization, and not-found failures', async ({
    client,
  }) => {
    const applicant = await createApplicant()
    const reviewer = await createReviewer()

    const staleSubmission = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
    }).create()
    const missingCommentApplication = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
    }).create()
    const approvedApplication = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.APPROVED,
      assignedReviewerId: reviewer.id,
    }).create()

    const responses = [
      await client
        .post(`/api/v1/applicant/applications/${staleSubmission.id}/submissions`)
        .withGuard('web')
        .loginAs(applicant)
        .json({}),
      await client
        .post(`/api/v1/reviewer/applications/${missingCommentApplication.id}/rejections`)
        .withGuard('web')
        .loginAs(reviewer)
        .json({}),
      await client
        .post(`/api/v1/reviewer/applications/${approvedApplication.id}/approvals`)
        .withGuard('web')
        .loginAs(applicant)
        .json({}),
      await client
        .post('/api/v1/applicant/applications/999999/reopen')
        .withGuard('web')
        .loginAs(applicant)
        .json({}),
    ]

    assertProblemDetails(responses[0].body(), 409)
    assertProblemDetails(responses[1].body(), 422, { validation: true })
    assertProblemDetails(responses[2].body(), 403)
    assertProblemDetails(responses[3].body(), 404)
  })
})
