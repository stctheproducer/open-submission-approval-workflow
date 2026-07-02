import { Exception } from '@adonisjs/core/exceptions'

export default class ApplicationChangeRequestConflictException extends Exception {
  static status = 409
  static code = 'E_APPLICATION_CHANGE_REQUEST_CONFLICT'

  constructor(message = 'Application cannot request changes in its current state') {
    super(message)
  }
}
