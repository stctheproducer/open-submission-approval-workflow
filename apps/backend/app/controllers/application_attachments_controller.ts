import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import ApplicationTransformer from '#transformers/application_transformer'
import ApplicationAttachmentService from '#services/application_attachment_service'
import { applicationAttachmentValidator } from '#validators/application_attachment'
import { ApplicationStatus } from '#values/application_status'
import ApplicationTransitionConflictException from '#exceptions/application_transition_conflict_exception'

@inject()
export default class ApplicationAttachmentsController {
  constructor(protected attachmentService: ApplicationAttachmentService) {}

  async store({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { attachment } = await request.validateUsing(applicationAttachmentValidator)

    const application = await Application.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    if (application.status !== ApplicationStatus.DRAFT) {
      throw new ApplicationTransitionConflictException()
    }

    const updated = await this.attachmentService.replace(application, attachment)

    return serialize(ApplicationTransformer.transform(updated))
  }
}
