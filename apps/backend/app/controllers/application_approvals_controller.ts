import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import ApplicationPolicy from '#policies/application_policy'
import ApplicationApprovalService from '#services/application_approval_service'
import ApplicationTransformer from '#transformers/application_transformer'

export default class ApplicationApprovalsController {
  @inject()
  async store(
    { auth, bouncer, params, response, serialize }: HttpContext,
    approvalService: ApplicationApprovalService
  ) {
    const user = auth.getUserOrFail()
    if (user.role !== 'reviewer') {
      return response.forbidden({ errors: [{ message: 'Forbidden' }] })
    }

    const application = await Application.findOrFail(params.applicationId)
    await bouncer.with(ApplicationPolicy).authorize('approve', application)

    const approvedApplication = await approvalService.approve(application.id, user)

    response.status(200)
    return serialize(
      ApplicationTransformer.transform(approvedApplication).useVariant('forDetailedView')
    )
  }
}
