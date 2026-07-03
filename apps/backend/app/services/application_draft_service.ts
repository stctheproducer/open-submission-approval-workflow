import Application from '#models/application'
import { ApplicationStatus } from '#values/application_status'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'

export default class ApplicationDraftService {
  async create(
    userId: number,
    payload: { title: string; category: string; description: string; amount: number }
  ) {
    const application = await Application.create({
      ...payload,
      amount: payload.amount.toFixed(2),
      userId,
      status: ApplicationStatus.DRAFT,
    })

    await application.load('user')

    return application
  }

  async listForUser(userId: number, page: number, perPage: number) {
    return Application.query()
      .where('userId', userId)
      .preload('user')
      .preload('assignedReviewer')
      .orderBy('createdAt', 'desc')
      .paginate(page, perPage)
  }

  async findForUser(userId: number, id: number) {
    return Application.query()
      .where('userId', userId)
      .where('id', id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('statusTransitions', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()
  }

  async update(
    application: Application,
    payload: { title?: string; category?: string; description?: string; amount?: number }
  ) {
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new ApplicationTransitionConflictException()
    }

    application.merge({
      ...payload,
      amount: payload.amount === undefined ? undefined : payload.amount.toFixed(2),
    })
    await application.save()
    return application
  }
}
