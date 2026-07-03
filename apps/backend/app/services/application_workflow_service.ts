import db from '@adonisjs/lucid/services/db'
import Application from '#models/application'
import type User from '#models/user'
import { ApplicationStatus } from '#values/application_status'
import ApplicationAuditEntry from '#models/application_audit_entry'
import ApplicationStatusTransition from '#models/application_status_transition'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'

export default class ApplicationWorkflowService {
  async reopenDraft(application: Application, applicant: User) {
    const updated = await db.transaction(async (trx) => {
      const locked = await Application.findOrFail(application.id, { client: trx })
      locked.useTransaction(trx)

      if (locked.status !== ApplicationStatus.CHANGES_REQUESTED) {
        throw new ApplicationTransitionConflictException()
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

      const transition = new ApplicationStatusTransition()
      transition.useTransaction(trx)
      transition.applicationId = locked.id
      transition.actorUserId = applicant.id
      transition.previousStatus = ApplicationStatus.CHANGES_REQUESTED
      transition.nextStatus = ApplicationStatus.DRAFT
      transition.comment = 'Reopened by applicant'
      await transition.save()

      return locked
    })

    return Application.query()
      .where('id', updated.id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('statusTransitions', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }

  async requestChange(application: Application, reviewer: User, comment: string) {
    const updated = await db.transaction(async (trx) => {
      const locked = await Application.findOrFail(application.id, { client: trx })
      locked.useTransaction(trx)

      if (locked.status !== ApplicationStatus.UNDER_REVIEW) {
        throw new ApplicationTransitionConflictException()
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

      const transition = new ApplicationStatusTransition()
      transition.useTransaction(trx)
      transition.applicationId = locked.id
      transition.actorUserId = reviewer.id
      transition.previousStatus = ApplicationStatus.UNDER_REVIEW
      transition.nextStatus = ApplicationStatus.CHANGES_REQUESTED
      transition.comment = comment
      await transition.save()

      return locked
    })

    return Application.query()
      .where('id', updated.id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('statusTransitions', (query) => {
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

      const transition = new ApplicationStatusTransition()
      transition.useTransaction(trx)
      transition.applicationId = locked.id
      transition.actorUserId = reviewer.id
      transition.previousStatus = ApplicationStatus.UNDER_REVIEW
      transition.nextStatus = ApplicationStatus.REJECTED
      transition.comment = comment
      await transition.save()

      return locked
    })

    return Application.query()
      .where('id', updated.id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('statusTransitions', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }
}
