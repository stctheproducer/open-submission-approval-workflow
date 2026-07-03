import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import ApplicationPolicy from '#policies/application_policy'
import ApplicationWorkflowService from '#services/application_workflow_service'
import ApplicationTransformer from '#transformers/application_transformer'
import { rejectApplicationValidator } from '#validators/application_rejection'

export default class ApplicationRejectionsController {
  @inject()
  async store(
    { auth, bouncer, params, request, response, serialize }: HttpContext,
    workflowService: ApplicationWorkflowService
  ) {
    const user = auth.getUserOrFail()

    const application = await Application.findOrFail(params.application_id)
    await bouncer.with(ApplicationPolicy).authorize('reject', application)
    const payload = await request.validateUsing(rejectApplicationValidator)
    const updated = await workflowService.reject(application, user, payload.comment)

    response.status(200)
    return serialize(ApplicationTransformer.transform(updated).useVariant('forDetailedView'))
  }
}
