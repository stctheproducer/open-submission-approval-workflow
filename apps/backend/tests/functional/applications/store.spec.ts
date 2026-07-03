import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { assertProblemDetails } from './problem_details.js'

test.group('Applications store', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('creates a blank draft application for the authenticated applicant and returns the wrapped resource (201)', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()

    const response = await client
      .visit('applicant.applications.store')
      .withGuard('web')
      .loginAs(applicant)
      .json({})

    response.assertStatus(201)
    response.assertBodyContains({
      data: { status: 'draft' },
    })
    const body = response.body() as { data: { id: number } }
    if (typeof body.data.id !== 'number') {
      throw new Error(`Expected data.id to be a number, got ${typeof body.data.id}`)
    }
    await db.assertHas('applications', { user_id: applicant.id, status: 'draft' })
  })

  test('rejects unauthenticated requests to create an application (401)', async ({ client }) => {
    const response = await client.visit('applicant.applications.store').json({})

    response.assertStatus(401)
    assertProblemDetails(response.body(), 401)
  })

  test('rejects an invalid store payload with field-level errors (422)', async ({ client }) => {
    const applicant = await UserFactory.create()

    const response = await client
      .visit('applicant.applications.store')
      .withGuard('web')
      .loginAs(applicant)
      .json({ contactEmail: 'not-an-email', category: 'Unsupported' as any })

    response.assertStatus(422)
    assertProblemDetails(response.body(), 422, { validation: true })
  })
})
