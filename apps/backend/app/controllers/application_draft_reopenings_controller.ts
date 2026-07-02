import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import ApplicationPolicy from '#policies/application_policy'
import ApplicationWorkflowService from '#services/application_workflow_service'

export default class ApplicationDraftReopeningsController {
  @inject()
  async store(
    { auth, bouncer, params, response, serialize }: HttpContext,
    workflowService: ApplicationWorkflowService
  ) {
    const user = auth.getUserOrFail()
    const application = await Application.findOrFail(params.id)
    await bouncer.with(ApplicationPolicy).authorize('reopenDraft', application)
    const updated = await workflowService.reopenDraft(application, user)

    response.status(200)
    return serialize.withoutWrapping({
      application: { id: updated.id, status: updated.status, updatedAt: updated.updatedAt },
    })
  }
}
