import db from '@adonisjs/lucid/services/db'
import Application from '#models/application'
import type User from '#models/user'
import ApplicationAuditLogEntry from '#models/application_audit_log_entry'
import { ApplicationStatus } from '#values/application_status'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'

export default class ApplicationSubmissionService {
  async submit(application: Application, actor: User) {
    await db.transaction(async (trx) => {
      const locked = await Application.findOrFail(application.id, { client: trx })
      locked.useTransaction(trx)

      if (locked.status !== ApplicationStatus.DRAFT) {
        throw new ApplicationTransitionConflictException()
      }

      locked.status = ApplicationStatus.SUBMITTED
      await locked.save()

      const entry = new ApplicationAuditLogEntry()
      entry.useTransaction(trx)
      entry.applicationId = locked.id
      entry.actorUserId = actor.id
      entry.previousStatus = ApplicationStatus.DRAFT
      entry.nextStatus = ApplicationStatus.SUBMITTED
      entry.comment = null
      await entry.save()
    })

    return Application.query()
      .where('id', application.id)
      .preload('statusTransitions', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .preload('auditLogEntries', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }
}
