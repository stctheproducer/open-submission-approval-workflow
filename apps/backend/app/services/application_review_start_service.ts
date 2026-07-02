import db from '@adonisjs/lucid/services/db'
import Application from '#models/application'
import ApplicationAuditLogEntry from '#models/application_audit_log_entry'
import type User from '#models/user'
import { ApplicationStatus } from '#values/application_status'
import ApplicationReviewTransitionConflictException from '#exceptions/application_review_transition_conflict_exception'

export default class ApplicationReviewStartService {
  async start(applicationId: number, reviewer: User) {
    const application = await Application.query().where('id', applicationId).firstOrFail()

    if (application.status !== ApplicationStatus.SUBMITTED || application.assignedReviewerId) {
      throw new ApplicationReviewTransitionConflictException()
    }

    await db.transaction(async (trx) => {
      const locked = await Application.query({ client: trx })
        .where('id', applicationId)
        .firstOrFail()
      if (locked.status !== ApplicationStatus.SUBMITTED || locked.assignedReviewerId) {
        throw new ApplicationReviewTransitionConflictException()
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
