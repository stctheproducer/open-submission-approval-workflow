import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'

test.group('Applications update', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('rejects unauthenticated requests to update an application (401)', async ({ client }) => {
    const application = await ApplicationFactory.create()

    const response = await client
      .visit('applicant.applications.update', { id: application.id })
      .json({ organizationName: 'Test Org' })

    response.assertStatus(401)
  })

  test('updates an owned draft application and returns the wrapped resource (200)', async ({
    client,
    db,
  }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({ userId: applicant.id }).create()

    const payload = {
      organizationName: 'Updated Org',
      contactName: 'Jane Doe',
      contactEmail: 'jane@example.com',
    }

    const response = await client
      .visit('applicant.applications.update', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json(payload)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: application.id,
        organizationName: 'Updated Org',
        contactName: 'Jane Doe',
        contactEmail: 'jane@example.com',
      },
    })
    await db.assertHas('applications', {
      id: application.id,
      organization_name: 'Updated Org',
      contact_name: 'Jane Doe',
      contact_email: 'jane@example.com',
    })
  })

  test('rejects an invalid update payload with field-level errors (422)', async ({ client }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({ userId: applicant.id }).create()

    const response = await client
      .visit('applicant.applications.update', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .json({ contactEmail: 'not-an-email' })

    response.assertStatus(422)
    const body = response.body() as { errors?: unknown[] }
    if (!body.errors || !Array.isArray(body.errors) || body.errors.length === 0) {
      throw new Error(`Expected errors array, got ${JSON.stringify(body)}`)
    }
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
        .json({ organizationName: 'Test Org' })

      response.assertStatus(404)
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
      .json({ organizationName: 'Updated Org' })

    response.assertStatus(409)
    await db.assertHas('applications', {
      id: application.id,
      status: ApplicationStatus.SUBMITTED,
    })
  })
})
