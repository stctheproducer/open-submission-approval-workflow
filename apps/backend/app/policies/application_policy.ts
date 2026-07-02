import type User from '#models/user'
import type Application from '#models/application'
import { BasePolicy, AuthorizationResponse } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ApplicationPolicy extends BasePolicy {
  view(user: User, application: Application): AuthorizerResponse {
    if (user.id === application.userId) {
      return AuthorizationResponse.allow()
    }

    return AuthorizationResponse.deny('Application not found', 404)
  }

  update(user: User, application: Application): AuthorizerResponse {
    if (user.id === application.userId) {
      return AuthorizationResponse.allow()
    }

    return AuthorizationResponse.deny('Application not found', 404)
  }
}
