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
      title: faker.company.name(),
      category: faker.commerce.department(),
      description: faker.lorem.paragraph(),
      amount: faker.number.float({ min: 1000, max: 5000, fractionDigits: 2 }).toString(),
      organizationName: faker.company.name(),
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email().toLowerCase(),
    }
  })
  .build()
