import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ApplicationTransformer from '#transformers/application_transformer'
import ApplicationDraftService from '#services/application_draft_service'
import { createApplicationValidator, updateApplicationValidator } from '#validators/application'

@inject()
export default class ApplicationsController {
  constructor(protected draftService: ApplicationDraftService) {}

  async index({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 20)), 100)

    const applications = await this.draftService.listForUser(user.id, page, perPage)
    applications.baseUrl(request.url())

    return serialize(ApplicationTransformer.paginate(applications.all(), applications.getMeta()))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createApplicationValidator)

    const application = await this.draftService.create(user.id, payload)

    response.status(201)
    return serialize(ApplicationTransformer.transform(application))
  }

  async show({ auth, params, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const application = await this.draftService.findForUser(user.id, params.id)

    return serialize(ApplicationTransformer.transform(application))
  }

  async update({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateApplicationValidator)

    const application = await this.draftService.findForUser(user.id, params.id)
    const updated = await this.draftService.update(application, payload)

    return serialize(ApplicationTransformer.transform(updated))
  }
}
