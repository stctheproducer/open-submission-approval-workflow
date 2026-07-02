import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ApplicationTransformer from '#transformers/application_transformer'
import ApplicationReviewStartService from '#services/application_review_start_service'

export default class ApplicationReviewStartsController {
  @inject()
  async store(
    { auth, params, response, serialize }: HttpContext,
    reviewStartService: ApplicationReviewStartService
  ) {
    const user = auth.getUserOrFail()
    if (user.role !== 'reviewer') {
      return response.forbidden({ errors: [{ message: 'Forbidden' }] })
    }

    const application = await reviewStartService.start(params.id, user)
    response.status(200)
    return serialize(ApplicationTransformer.transform(application))
  }
}
