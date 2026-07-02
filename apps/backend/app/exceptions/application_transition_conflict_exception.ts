import { Exception } from '@adonisjs/core/exceptions'

export default class ApplicationTransitionConflictException extends Exception {
  static status = 409
  static code = 'E_APPLICATION_TRANSITION_CONFLICT'

  constructor(message = 'Application cannot be edited in its current state') {
    super(message)
  }
}
