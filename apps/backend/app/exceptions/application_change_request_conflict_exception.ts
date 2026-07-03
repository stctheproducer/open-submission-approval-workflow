import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class ApplicationChangeRequestConflictException extends Exception {
  static status = 409
  static code = 'E_APPLICATION_CHANGE_REQUEST_CONFLICT'

  constructor(message = 'Application cannot request changes in its current state') {
    super(message)
  }

  async handle(_error: this, ctx: HttpContext) {
    ctx.response.status(ApplicationChangeRequestConflictException.status)
    return ctx.serialize.withoutWrapping({
      type: 'about:blank',
      title: 'Conflict',
      status: ApplicationChangeRequestConflictException.status,
      detail: this.message,
      instance: ctx.request.url(),
    })
  }
}
