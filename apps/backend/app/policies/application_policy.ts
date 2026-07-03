import type User from '#models/user'
import type Application from '#models/application'
import { BasePolicy, AuthorizationResponse } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ApplicationPolicy extends BasePolicy {
  reviewQueue(user: User): AuthorizerResponse {
    if (user.role === 'reviewer') {
      return AuthorizationResponse.allow()
    }

    return AuthorizationResponse.deny('Reviewer access is required to view the review queue.', 403)
  }

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

  approve(user: User, application: Application): AuthorizerResponse {
    if (user.role !== 'reviewer') {
      return AuthorizationResponse.deny('Only reviewers can approve applications.', 403)
    }

    if (application.assignedReviewerId !== user.id) {
      return AuthorizationResponse.deny(
        'Only the assigned reviewer can approve this application.',
        403
      )
    }

    return AuthorizationResponse.allow()
  }

  requestChange(user: User, application: Application): AuthorizerResponse {
    if (user.role !== 'reviewer') {
      return AuthorizationResponse.deny('Only reviewers can request changes on applications.', 403)
    }

    if (application.assignedReviewerId !== user.id) {
      return AuthorizationResponse.deny(
        'Only the assigned reviewer can request changes on this application.',
        403
      )
    }

    return AuthorizationResponse.allow()
  }

  reject(user: User, application: Application): AuthorizerResponse {
    if (user.role !== 'reviewer') {
      return AuthorizationResponse.deny('Only reviewers can reject applications.', 403)
    }

    if (application.assignedReviewerId !== user.id) {
      return AuthorizationResponse.deny(
        'Only the assigned reviewer can reject this application.',
        403
      )
    }

    return AuthorizationResponse.allow()
  }

  reopenDraft(user: User, application: Application): AuthorizerResponse {
    if (user.id !== application.userId) {
      return AuthorizationResponse.deny('Only the application owner can reopen this draft.', 403)
    }

    return AuthorizationResponse.allow()
  }
}
