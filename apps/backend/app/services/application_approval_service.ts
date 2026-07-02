import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'
import User from '#models/user'
import Application from '#models/application'
import { ApplicationStatus } from '#values/application_status'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'
import ApplicationStatusTransition from '#models/application_status_transition'

@inject()
export default class ApplicationApprovalService {
  async approve(applicationId: number, reviewer: User): Promise<Application> {
    const application = await db.transaction(async (trx) => {
      const application = await Application.findOrFail(applicationId, { client: trx })
      application.useTransaction(trx)

      if (application.status !== ApplicationStatus.UNDER_REVIEW) {
        throw new ApplicationTransitionConflictException()
      }

      application.status = ApplicationStatus.APPROVED
      await application.save()

      const transition = new ApplicationStatusTransition()
      transition.applicationId = application.id
      transition.actorUserId = reviewer.id
      transition.previousStatus = ApplicationStatus.UNDER_REVIEW
      transition.nextStatus = ApplicationStatus.APPROVED
      transition.useTransaction(trx)
      await transition.save()

      return application
    })

    await application.load((loader) => {
      loader.load('user')
      loader.load('assignedReviewer')
      loader.load('statusTransitions', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
    })

    return application
  }
}
