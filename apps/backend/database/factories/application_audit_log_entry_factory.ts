import factory from '@adonisjs/lucid/factories'
import ApplicationAuditLogEntry from '#models/application_audit_log_entry'
import { ApplicationStatus } from '#values/application_status'
import { ApplicationFactory } from '#database/factories/application_factory'
import { UserFactory } from '#database/factories/user_factory'

export const ApplicationAuditLogEntryFactory = factory
  .define(ApplicationAuditLogEntry, async ({ faker }) => {
    const application = await ApplicationFactory.create()
    const actor = await UserFactory.create()
    return {
      applicationId: application.id,
      actorUserId: actor.id,
      previousStatus: ApplicationStatus.DRAFT,
      nextStatus: ApplicationStatus.SUBMITTED,
      comment: faker.lorem.sentence(),
    }
  })
  .build()
