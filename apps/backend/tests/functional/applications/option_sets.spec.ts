import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { APPLICATION_CATEGORY_OPTIONS } from '#values/application_category_options'

test.group('Application option sets', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('returns the shared category option set for authenticated applicants', async ({
    client,
  }) => {
    const applicant = await UserFactory.create()

    const response = await client
      .visit('applicant.applicationOptionSets.index')
      .withGuard('web')
      .loginAs(applicant)

    response.assertStatus(200)
    response.assertBodyContains({
      data: APPLICATION_CATEGORY_OPTIONS,
    })
    const body = response.body() as unknown as { data: Array<{ value: string; label: string }> }
    if (body.data.length !== APPLICATION_CATEGORY_OPTIONS.length) {
      throw new Error(
        `Expected ${APPLICATION_CATEGORY_OPTIONS.length} options, got ${body.data.length}`
      )
    }
  })

  test('rejects unauthenticated requests for the category option set', async ({ client }) => {
    const response = await client.visit('applicant.applicationOptionSets.index')

    response.assertStatus(401)
  })
})
