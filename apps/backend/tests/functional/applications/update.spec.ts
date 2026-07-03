import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'
import { assertProblemDetails } from './problem_details.js'

test.group('Applications update', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects unauthenticated requests to update an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.create()

    const response = await client
      .visit('applicant.applications.update', { id: application.id })
      .json({
        title: 'Updated title',
        category: 'Technology',
        description: 'Updated description',
        amount: 987.65,
      })

    response.assertStatus(401)
    assertProblemDetails(response.body(), 401)
  })

  test('updates an owned draft application and returns the wrapped resource (200)', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({ userId: applicant.id }).create()

    const payload = {
      title: 'Updated title',
      category: 'Finance',
      description: 'Updated description',
      amount: 987.65,
    } as const

    const response = await client
      .visit('applicant.applications.update', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json(payload)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: application.id,
        title: 'Updated title',
        category: 'Finance',
        description: 'Updated description',
        amount: '987.65',
      },
    })
    await db.assertHas('applications', {
      id: application.id,
      title: 'Updated title',
      category: 'Finance',
      description: 'Updated description',
    })
  })

  test('rejects an invalid update payload with field-level errors (422)', async ({ client }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({ userId: applicant.id }).create()

    const response = await client
      .visit('applicant.applications.update', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json({
        title: 'Updated title',
        category: 'Unsupported' as any,
        description: 'Updated description',
        amount: 987.65,
      } as const)

    response.assertStatus(422)
    assertProblemDetails(response.body(), 422, { validation: true })
  })

  test('returns 404 when updating a foreign or non-existent application — "{label}"')
    .with([
      {
        label: 'foreign application',
        getId: async () => {
          const otherApplicant = await UserFactory.create()
          const foreignApp = await ApplicationFactory.merge({ userId: otherApplicant.id }).create()
          return foreignApp.id
        },
      },
      { label: 'non-existent application', getId: async () => 999999 },
    ])
    .run(async ({ client }, { getId }) => {
      const applicant = await UserFactory.create()
      const id = await getId()

      const response = await client
        .visit('applicant.applications.update', { id })
        .withGuard('web')
        .loginAs(applicant)
        .json({
          title: 'Updated title',
          category: 'Technology',
          description: 'Updated description',
          amount: 987.65,
        } as const)

      response.assertStatus(404)
      assertProblemDetails(response.body(), 404)
    })

  test('rejects updates to a non-draft application with a conflict error', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
    }).create()

    const response = await client
      .visit('applicant.applications.update', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json({
        title: 'Updated title',
        category: 'Technology',
        description: 'Updated description',
        amount: 987.65,
      } as const)

    response.assertStatus(409)
    assertProblemDetails(response.body(), 409)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.SUBMITTED,
    })
  })
})
