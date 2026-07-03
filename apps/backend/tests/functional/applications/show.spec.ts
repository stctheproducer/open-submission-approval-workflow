import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatusTransitionFactory } from '#database/factories/application_status_transition_factory'
import { DateTime } from 'luxon'
import { ApplicationStatus } from '#values/application_status'
import { assertProblemDetails } from './problem_details.js'

const NON_EXISTENT_ID = 99999999

test.group('Applications show', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects unauthenticated requests to view an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.create()
    const response = await client.visit('applicant.applications.show', { id: application.id })
    response.assertStatus(401)
    assertProblemDetails(response.body(), 401)
  })

  test('shows an owned draft application and returns the wrapped resource (200)', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({ userId: applicant.id }).create()

    const response = await client
      .visit('applicant.applications.show', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: application.id,
        status: 'draft',
        title: application.title,
        category: application.category,
        description: application.description,
        amount: application.amount,
      },
    })

    const body = response.body() as any
    if (!Array.isArray(body.data.history) || body.data.history.length !== 0) {
      throw new Error(`Expected no history entries, got ${JSON.stringify(body.data.history)}`)
    }

    await db.assertHas('applications', { id: application.id, user_id: applicant.id })
  })

  test('shows an owned submitted application with the ordered history array (200)', async ({
    client,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
    }).create()

    await ApplicationStatusTransitionFactory.merge({
      applicationId: application.id,
      actorUserId: applicant.id,
      previousStatus: ApplicationStatus.DRAFT,
      nextStatus: ApplicationStatus.SUBMITTED,
      createdAt: DateTime.now().minus({ minutes: 2 }),
    }).create()
    await ApplicationStatusTransitionFactory.merge({
      applicationId: application.id,
      actorUserId: applicant.id,
      previousStatus: ApplicationStatus.SUBMITTED,
      nextStatus: ApplicationStatus.UNDER_REVIEW,
      createdAt: DateTime.now().minus({ minutes: 1 }),
    }).create()

    const response = await client
      .visit('applicant.applications.show', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: application.id,
        status: ApplicationStatus.SUBMITTED,
      },
    })

    const body = response.body() as any
    if (!Array.isArray(body.data.history) || body.data.history.length !== 2) {
      throw new Error(`Expected 2 history entries, got ${JSON.stringify(body.data.history)}`)
    }
    if (body.data.history[0].nextStatus !== ApplicationStatus.SUBMITTED) {
      throw new Error(`Expected oldest history first, got ${JSON.stringify(body.data.history)}`)
    }
    if (body.data.history[0].actor?.id !== applicant.id) {
      throw new Error(
        `Expected history actor to be preloaded, got ${JSON.stringify(body.data.history)}`
      )
    }
  })

  test('returns 404 for a foreign or non-existent application', async ({ client }) => {
    const applicant = await UserFactory.create()
    const otherApplicant = await UserFactory.create()
    const otherApp = await ApplicationFactory.merge({ userId: otherApplicant.id }).create()

    const otherAppResponse = await client
      .visit('applicant.applications.show', { id: otherApp.id })
      .withGuard('web')
      .loginAs(applicant)
    otherAppResponse.assertStatus(404)
    assertProblemDetails(otherAppResponse.body(), 404)

    const nonExistentResponse = await client
      .visit('applicant.applications.show', { id: NON_EXISTENT_ID })
      .withGuard('web')
      .loginAs(applicant)
    nonExistentResponse.assertStatus(404)
    assertProblemDetails(nonExistentResponse.body(), 404)
  })
})
