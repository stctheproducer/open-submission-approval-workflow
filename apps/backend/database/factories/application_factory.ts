import factory from '@adonisjs/lucid/factories'
import Application from '#models/application'
import { ApplicationStatus } from '#values/application_status'
import { UserFactory } from '#database/factories/user_factory'

export const ApplicationFactory = factory
  .define(Application, async ({ faker }) => {
    const user = await UserFactory.create()
    return {
      userId: user.id,
      status: ApplicationStatus.DRAFT,
      organizationName: faker.company.name(),
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email().toLowerCase(),
    }
  })
  .build()
