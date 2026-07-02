import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'

test.group('Applications index', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('rejects unauthenticated requests to the applications index (401)', async ({ client }) => {
    const response = await client.visit('applicant.applications.index')
    response.assertStatus(401)
  })

  test("lists only the authenticated applicant's own applications with pagination metadata", async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const otherUser = await UserFactory.create()
    const [app1, app2, app3] = await ApplicationFactory
      .merge({ userId: applicant.id })
      .createMany(3)
    const otherApp = await ApplicationFactory.merge({ userId: otherUser.id }).create()

    const response = await client
      .visit('applicant.applications.index')
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(200)
    const body = response.body() as any
    response.assertBodyContains({
      metadata: { perPage: 20, total: 3, lastPage: 1, currentPage: 1 },
    })
    const ids = (body.data as Array<{ id: number }>).map((app) => app.id)
    if (ids.join(',') !== [app3.id, app2.id, app1.id].join(',')) {
      throw new Error(`Expected newest-first ids, got ${ids.join(',')}`)
    }

    for (const app of [app1, app2, app3]) {
      await db.assertHas('applications', { id: app.id })
    }
    await db.assertHas('applications', {
      id: otherApp.id,
      user_id: otherUser.id,
    })
  })

  test('returns an empty paginated collection when the applicant has no applications', async ({
    client,
  }) => {
    const applicant = await UserFactory.create()

    const response = await client
      .visit('applicant.applications.index')
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [],
      metadata: { perPage: 20, total: 0, lastPage: 1, currentPage: 1 },
    })
  })
})
