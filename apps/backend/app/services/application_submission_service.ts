import db from '@adonisjs/lucid/services/db'
import Application from '#models/application'
import type User from '#models/user'
import ApplicationStatusTransition from '#models/application_status_transition'
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
      locked.assignedReviewerId = null
      await locked.save()

      const transition = new ApplicationStatusTransition()
      transition.useTransaction(trx)
      transition.applicationId = locked.id
      transition.actorUserId = actor.id
      transition.previousStatus = ApplicationStatus.DRAFT
      transition.nextStatus = ApplicationStatus.SUBMITTED
      transition.comment = null
      await transition.save()
    })

    return Application.query()
      .where('id', application.id)
      .preload('statusTransitions', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }
}
