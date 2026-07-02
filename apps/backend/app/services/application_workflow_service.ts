import db from '@adonisjs/lucid/services/db'
import Application from '#models/application'
import User from '#models/user'
import { ApplicationStatus } from '#values/application_status'
import ApplicationChangeRequestConflictException from '#exceptions/application_change_request_conflict_exception'
import ApplicationAuditEntry from '#models/application_audit_entry'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'

export default class ApplicationWorkflowService {
  async reopenDraft(application: Application, applicant: User) {
    const updated = await db.transaction(async (trx) => {
      const locked = await Application.findOrFail(application.id, { client: trx })
      locked.useTransaction(trx)

      if (locked.status !== ApplicationStatus.CHANGES_REQUESTED) {
        throw new ApplicationChangeRequestConflictException()
      }

      locked.status = ApplicationStatus.DRAFT
      await locked.save()

      const entry = new ApplicationAuditEntry()
      entry.useTransaction(trx)
      entry.applicationId = locked.id
      entry.actorId = applicant.id
      entry.fromStatus = ApplicationStatus.CHANGES_REQUESTED
      entry.toStatus = ApplicationStatus.DRAFT
      entry.comment = 'Reopened by applicant'
      await entry.save()

      return locked
    })

    return Application.query()
      .where('id', updated.id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('auditLogEntries', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }

  async requestChange(application: Application, reviewer: User, comment: string) {
    const updated = await db.transaction(async (trx) => {
      const locked = await Application.findOrFail(application.id, { client: trx })
      locked.useTransaction(trx)

      if (locked.status !== ApplicationStatus.UNDER_REVIEW) {
        throw new ApplicationChangeRequestConflictException()
      }

      locked.status = ApplicationStatus.CHANGES_REQUESTED
      await locked.save()

      const entry = new ApplicationAuditEntry()
      entry.useTransaction(trx)
      entry.applicationId = locked.id
      entry.actorId = reviewer.id
      entry.fromStatus = ApplicationStatus.UNDER_REVIEW
      entry.toStatus = ApplicationStatus.CHANGES_REQUESTED
      entry.comment = comment
      await entry.save()

      return locked
    })

    return Application.query()
      .where('id', updated.id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('auditLogEntries', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }

  async reject(application: Application, reviewer: User, comment: string) {
    const updated = await db.transaction(async (trx) => {
      const locked = await Application.findOrFail(application.id, { client: trx })
      locked.useTransaction(trx)

      if (locked.status !== ApplicationStatus.UNDER_REVIEW) {
        throw new ApplicationTransitionConflictException()
      }

      locked.status = ApplicationStatus.REJECTED
      await locked.save()

      const entry = new ApplicationAuditEntry()
      entry.useTransaction(trx)
      entry.applicationId = locked.id
      entry.actorId = reviewer.id
      entry.fromStatus = ApplicationStatus.UNDER_REVIEW
      entry.toStatus = ApplicationStatus.REJECTED
      entry.comment = comment
      await entry.save()

      return locked
    })

    return Application.query()
      .where('id', updated.id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('auditLogEntries', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }
}
