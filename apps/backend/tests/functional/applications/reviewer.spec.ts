import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatusTransitionFactory } from '#database/factories/application_status_transition_factory'
import { ApplicationStatus } from '#values/application_status'
import { assertProblemDetails } from './problem_details.js'

async function createReviewer() {
  const reviewer = await UserFactory.create()
  reviewer.role = 'reviewer'
  await User.query().where('id', reviewer.id).update({ role: 'reviewer' })
  return reviewer
}

test.group('Reviewer applications', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects unauthenticated requests to the reviewer queue (401)', async ({ client }) => {
    const response = await client.visit('reviewer.applications.index')
    response.assertStatus(401)
    assertProblemDetails(response.body(), 401)
  })

  test('rejects non-reviewer users from the reviewer queue (403)', async ({ client }) => {
    const applicant = await UserFactory.create()

    const response = await client
      .visit('reviewer.applications.index')
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(403)
    assertProblemDetails(response.body(), 403)
  })

  test('lists the combined reviewer queue paginated with most-recent-first ordering (200)', async ({
    client,
  }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const readyOne = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
      title: 'Ready 1',
    }).create()
    const readyTwo = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
      title: 'Ready 2',
    }).create()
    const ownedOne = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
      title: 'Owned 1',
    }).create()
    const ownedTwo = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
      title: 'Owned 2',
    }).create()

    const response = await client
      .visit('reviewer.applications.index')
      .withGuard('web')
      .loginAs(reviewer)

    response.assertStatus(200)
    const body = response.body() as any
    if (body.data.length !== 4) {
      throw new Error(`Expected 4 queue items, got ${body.data.length}`)
    }
    const ids = body.data.map((item: { id: number }) => item.id)
    if (
      !ids.includes(readyOne.id) ||
      !ids.includes(readyTwo.id) ||
      !ids.includes(ownedOne.id) ||
      !ids.includes(ownedTwo.id)
    ) {
      throw new Error(
        `Expected queue items to include seeded applications, got ${JSON.stringify(ids)}`
      )
    }
  })

  test('keeps the selected review-state filter on reviewer queue pagination links (200)', async ({
    client,
  }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
      title: 'Ready 1',
    }).create()
    await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
      title: 'Ready 2',
    }).create()
    await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
      title: 'Owned 1',
    }).create()
    await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
      title: 'Owned 2',
    }).create()

    const response = await client
      .visit('reviewer.applications.index')
      .qs({ reviewState: 'owned', perPage: 1 })
      .withGuard('web')
      .loginAs(reviewer)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          status: ApplicationStatus.UNDER_REVIEW,
          assignedReviewer: {
            id: reviewer.id,
          },
        },
      ],
    })

    const body = response.body() as any
    if (
      typeof body.metadata.nextPageUrl !== 'string' ||
      !body.metadata.nextPageUrl.includes('reviewState=owned')
    ) {
      throw new Error(
        `Expected filtered pagination links to preserve reviewState, got ${JSON.stringify(
          body.metadata
        )}`
      )
    }
  })

  test('shows an application detail with the reviewer-detail variant (200)', async ({ client }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: reviewer.id,
      title: 'Detail',
      category: 'Operations',
      description: 'Detail desc',
      amount: '1234.56',
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: application.id,
      actorUserId: reviewer.id,
      previousStatus: ApplicationStatus.SUBMITTED,
      nextStatus: ApplicationStatus.UNDER_REVIEW,
    }).create()

    const response = await client
      .visit('reviewer.applications.show', { id: application.id })
      .withGuard('web')
      .loginAs(reviewer)

    response.assertStatus(200)
    const body = response.body() as any
    if (
      !body.data.applicant ||
      !body.data.assignedReviewer ||
      body.data.reviewState !== 'owned' ||
      !Array.isArray(body.data.statusTransitions) ||
      body.data.statusTransitions.length !== 1 ||
      !Array.isArray(body.data.history) ||
      body.data.history.length !== 1
    ) {
      throw new Error(`Expected reviewer detail payload, got ${JSON.stringify(body.data)}`)
    }
  })

  test('rejects non-reviewer users from viewing an application (403)', async ({ client }) => {
    const applicant = await UserFactory.create()
    const owner = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: owner.id,
      status: ApplicationStatus.UNDER_REVIEW,
      title: 'Detail',
    }).create()

    const response = await client
      .visit('reviewer.applications.show', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(403)
    assertProblemDetails(response.body(), 403)
  })

  test('returns 404 for an inaccessible application (404)', async ({ client }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.DRAFT,
      title: 'Draft',
    }).create()

    const response = await client
      .visit('reviewer.applications.show', { id: application.id })
      .withGuard('web')
      .loginAs(reviewer)

    response.assertStatus(404)
    assertProblemDetails(response.body(), 404)
  })

  test('rejects non-reviewer users from starting review (403)', async ({ client }) => {
    const applicant = await UserFactory.create()
    const owner = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: owner.id,
      status: ApplicationStatus.SUBMITTED,
      title: 'Submit',
    }).create()

    const response = await (client.visit as any)('reviewer.application_review_starts.store', {
      id: application.id,
    })
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(403)
    assertProblemDetails(response.body(), 403)
  })

  test('starts review on an eligible submitted application and returns the updated detail (200)', async ({
    client,
    db,
  }) => {
    const reviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
      title: 'Submit',
      category: 'Operations',
      description: 'Need review',
      amount: '2500.00',
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: application.id,
      actorUserId: reviewer.id,
      previousStatus: ApplicationStatus.SUBMITTED,
      nextStatus: ApplicationStatus.UNDER_REVIEW,
    }).create()

    const response = await (client.visit as any)('reviewer.application_review_starts.store', {
      id: application.id,
    })
      .withGuard('web')
      .loginAs(reviewer)

    response.assertStatus(200)
    const body = response.body() as any
    if (
      body.data.status !== ApplicationStatus.UNDER_REVIEW ||
      body.data.assignedReviewer?.id !== reviewer.id ||
      !Array.isArray(body.data.statusTransitions) ||
      body.data.statusTransitions.length !== 2 ||
      !Array.isArray(body.data.history) ||
      body.data.history.length !== 2
    ) {
      throw new Error(`Expected owned under-review detail, got ${JSON.stringify(body.data)}`)
    }
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assigned_reviewer_id: reviewer.id,
    })
    await db.assertHas('application_audit_log_entries', {
      application_id: application.id,
      actor_user_id: reviewer.id,
      previous_status: ApplicationStatus.SUBMITTED,
      next_status: ApplicationStatus.UNDER_REVIEW,
    })
  })

  test('rejects starting review on an ineligible application with a conflict error (409)', async ({
    client,
    db,
  }) => {
    const reviewer = await createReviewer()
    const otherReviewer = await createReviewer()
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assignedReviewerId: otherReviewer.id,
      title: 'Owned',
    }).create()

    const response = await (client.visit as any)('reviewer.application_review_starts.store', {
      id: application.id,
    })
      .withGuard('web')
      .loginAs(reviewer)

    response.assertStatus(409)
    assertProblemDetails(response.body(), 409)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.UNDER_REVIEW,
      assigned_reviewer_id: otherReviewer.id,
    })
  })

  test('returns 404 when starting review on a non-existent application', async ({ client }) => {
    const reviewer = await createReviewer()
    const response = await (client.visit as any)('reviewer.application_review_starts.store', {
      id: 999999,
    })
      .withGuard('web')
      .loginAs(reviewer)

    response.assertStatus(404)
    assertProblemDetails(response.body(), 404)
  })
})
