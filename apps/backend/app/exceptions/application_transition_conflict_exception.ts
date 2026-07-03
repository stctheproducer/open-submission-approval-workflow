import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class ApplicationTransitionConflictException extends Exception {
  static status = 409
  static code = 'E_APPLICATION_TRANSITION_CONFLICT'

  constructor(message = 'Application cannot transition in its current state') {
    super(message)
  }

  async handle(_error: this, ctx: HttpContext) {
    ctx.response.status(ApplicationTransitionConflictException.status)
    return ctx.serialize.withoutWrapping({
      type: 'about:blank',
      title: 'Conflict',
      status: ApplicationTransitionConflictException.status,
      detail: this.message,
      instance: ctx.request.url(),
    })
  }
}
