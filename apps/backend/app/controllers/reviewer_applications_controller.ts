import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import ApplicationTransformer from '#transformers/application_transformer'
import { reviewerApplicationsIndexValidator } from '#validators/reviewer_application'

export default class ReviewerApplicationsController {
  async index({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'reviewer') {
      return response.forbidden({ errors: [{ message: 'Forbidden' }] })
    }

    const { reviewState } = await request.validateUsing(reviewerApplicationsIndexValidator)
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 20)), 100)

    const applications = await Application.query()
      .withScopes((scopes) => scopes.reviewQueue(user.id, reviewState))
      .preload('user')
      .preload('assignedReviewer')
      .orderBy('updatedAt', 'desc')
      .paginate(page, perPage)

    applications.baseUrl(request.url())
    return serialize(ApplicationTransformer.paginate(applications.all(), applications.getMeta()))
  }

  async show({ auth, response, params, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'reviewer') {
      return response.forbidden({ errors: [{ message: 'Forbidden' }] })
    }

    const application = await Application.query()
      .withScopes((scopes) => scopes.reviewQueue(user.id))
      .where('id', params.id)
      .preload('user')
      .preload('assignedReviewer')
      .preload('auditLogEntries', (query) => {
        query.preload('actor').orderBy('createdAt', 'asc')
      })
      .firstOrFail()

    return serialize(ApplicationTransformer.transform(application))
  }
}
