import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class ApplicationReviewTransitionConflictException extends Exception {
  static status = 409
  static code = 'E_APPLICATION_REVIEW_TRANSITION_CONFLICT'

  constructor(message = 'Application cannot start review in its current state') {
    super(message)
  }

  async handle(_error: this, ctx: HttpContext) {
    ctx.response.status(ApplicationReviewTransitionConflictException.status)
    return ctx.serialize.withoutWrapping({
      type: 'about:blank',
      title: 'Conflict',
      status: ApplicationReviewTransitionConflictException.status,
      detail: this.message,
      instance: ctx.request.url(),
    })
  }
}
