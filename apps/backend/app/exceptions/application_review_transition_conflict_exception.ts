import { Exception } from '@adonisjs/core/exceptions'

export default class ApplicationReviewTransitionConflictException extends Exception {
  static status = 409
  static code = 'E_APPLICATION_REVIEW_TRANSITION_CONFLICT'

  constructor(message = 'Application cannot start review in its current state') {
    super(message)
  }
}
