import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ApplicationTransformer from '#transformers/application_transformer'
import ApplicationDraftService from '#services/application_draft_service'
import ApplicationSubmissionService from '#services/application_submission_service'

@inject()
export default class ApplicationSubmissionsController {
  constructor(protected draftService: ApplicationDraftService) {}

  @inject()
  async store(
    { auth, params, serialize }: HttpContext,
    submissionService: ApplicationSubmissionService
  ) {
    const user = auth.getUserOrFail()
    const application = await this.draftService.findForUser(user.id, params.application_id)
    const submitted = await submissionService.submit(application, user)

    return serialize(ApplicationTransformer.transform(submitted).useVariant('forDetailedView'))
  }
}
