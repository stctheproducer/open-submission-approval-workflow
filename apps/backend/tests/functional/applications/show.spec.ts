import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'

const NON_EXISTENT_ID = 99999999

test.group('Applications show', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('rejects unauthenticated requests to view an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.create()
    const response = await client.visit('applicant.applications.show', { id: application.id })
    response.assertStatus(401)
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
        organizationName: application.organizationName,
        contactName: application.contactName,
        contactEmail: application.contactEmail,
      },
    })

    await db.assertHas('applications', { id: application.id, user_id: applicant.id })
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

    const nonExistentResponse = await client
      .visit('applicant.applications.show', { id: NON_EXISTENT_ID })
      .withGuard('web')
      .loginAs(applicant)
    nonExistentResponse.assertStatus(404)
  })
})
