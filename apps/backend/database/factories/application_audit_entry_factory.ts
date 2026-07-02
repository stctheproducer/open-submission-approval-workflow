import factory from '@adonisjs/lucid/factories'
import ApplicationAuditEntry from '#models/application_audit_entry'
import { ApplicationStatus } from '#values/application_status'
import { ApplicationFactory } from '#database/factories/application_factory'
import { UserFactory } from '#database/factories/user_factory'

export const ApplicationAuditEntryFactory = factory
  .define(ApplicationAuditEntry, async ({ faker }) => {
    const application = await ApplicationFactory.create()
    const actor = await UserFactory.create()
    return {
      applicationId: application.id,
      actorId: actor.id,
      fromStatus: ApplicationStatus.DRAFT,
      toStatus: ApplicationStatus.SUBMITTED,
      comment: faker.lorem.sentence(),
    }
  })
  .build()
