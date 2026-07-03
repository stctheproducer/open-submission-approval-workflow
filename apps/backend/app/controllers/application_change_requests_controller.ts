import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import ApplicationPolicy from '#policies/application_policy'
import ApplicationWorkflowService from '#services/application_workflow_service'
import { requestApplicationChangeValidator } from '#validators/application_change_request'

export default class ApplicationChangeRequestsController {
  @inject()
  async store(
    { auth, bouncer, params, request, response, serialize }: HttpContext,
    workflowService: ApplicationWorkflowService
  ) {
    const user = auth.getUserOrFail()
    if (user.role !== 'reviewer') {
      return response.forbidden({ errors: [{ message: 'Forbidden' }] })
    }

    const payload = await request.validateUsing(requestApplicationChangeValidator)
    const application = await Application.findOrFail(params.id)
    await bouncer.with(ApplicationPolicy).authorize('requestChange', application)
    const updated = await workflowService.requestChange(application, user, payload.comment)

    response.status(200)
    return serialize.withoutWrapping({
      application: { id: updated.id, status: updated.status, updatedAt: updated.updatedAt },
    })
  }
}
