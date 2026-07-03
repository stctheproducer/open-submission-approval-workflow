import type { HttpContext } from '@adonisjs/core/http'
import { APPLICATION_CATEGORY_OPTIONS } from '#values/application_category_options'

export default class ApplicationOptionSetsController {
  async index({ serialize }: HttpContext) {
    return serialize.withoutWrapping({
      data: APPLICATION_CATEGORY_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    })
  }
}
