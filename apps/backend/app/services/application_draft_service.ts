import Application from '#models/application'
import { ApplicationStatus } from '#values/application_status'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'

export default class ApplicationDraftService {
  async create(userId: number) {
    return Application.create({
      userId,
      status: ApplicationStatus.DRAFT,
    })
  }

  async listForUser(userId: number, page: number, perPage: number) {
    return Application.query()
      .where('userId', userId)
      .orderBy('createdAt', 'desc')
      .paginate(page, perPage)
  }

  async findForUser(userId: number, id: number) {
    return Application.query().where('userId', userId).where('id', id).firstOrFail()
  }

  async update(application: Application, payload: Record<string, unknown>) {
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new ApplicationTransitionConflictException()
    }

    application.merge(payload)
    await application.save()
    return application
  }
}
