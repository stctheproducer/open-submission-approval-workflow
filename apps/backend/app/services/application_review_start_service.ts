import db from '@adonisjs/lucid/services/db'
import Application from '#models/application'
import ApplicationAuditLogEntry from '#models/application_audit_log_entry'
import type User from '#models/user'
import { ApplicationStatus } from '#values/application_status'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'

export default class ApplicationReviewStartService {
  async start(applicationId: number, reviewer: User) {
    await db.transaction(async (trx) => {
      const locked = await Application.findOrFail(applicationId, { client: trx })
      if (locked.status !== ApplicationStatus.SUBMITTED || locked.assignedReviewerId) {
        throw new ApplicationTransitionConflictException()
      }

      locked.useTransaction(trx)
      locked.status = ApplicationStatus.UNDER_REVIEW
      locked.assignedReviewerId = reviewer.id
      await locked.save()

      const entry = new ApplicationAuditLogEntry()
      entry.useTransaction(trx)
      entry.applicationId = locked.id
      entry.actorUserId = reviewer.id
      entry.previousStatus = ApplicationStatus.SUBMITTED
      entry.nextStatus = ApplicationStatus.UNDER_REVIEW
      entry.comment = null
      await entry.save()
    })

    return Application.query()
      .where('id', applicationId)
      .preload('user')
      .preload('assignedReviewer')
      .preload('auditLogEntries', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }
}
