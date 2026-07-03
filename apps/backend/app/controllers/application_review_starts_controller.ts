import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import ApplicationPolicy from '#policies/application_policy'
import ApplicationTransformer from '#transformers/application_transformer'
import ApplicationReviewStartService from '#services/application_review_start_service'

export default class ApplicationReviewStartsController {
  @inject()
  async store(
    { auth, bouncer, params, response, serialize }: HttpContext,
    reviewStartService: ApplicationReviewStartService
  ) {
    const user = auth.getUserOrFail()
    await bouncer.with(ApplicationPolicy).authorize('reviewQueue')

    const application = await Application.findOrFail(params.id)
    const updated = await reviewStartService.start(application.id, user)
    response.status(200)
    return serialize(ApplicationTransformer.transform(updated))
  }
}
