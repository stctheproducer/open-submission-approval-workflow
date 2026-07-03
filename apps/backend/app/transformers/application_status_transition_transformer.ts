import type ApplicationStatusTransition from '#models/application_status_transition'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ApplicationStatusTransitionTransformer extends BaseTransformer<ApplicationStatusTransition> {
  toObject() {
    const actor = this.resource.actor
      ? {
          id: this.resource.actor.id,
          fullName: this.resource.actor.fullName,
          email: this.resource.actor.email,
          createdAt: this.resource.actor.createdAt,
          updatedAt: this.resource.actor.updatedAt,
          initials: this.resource.actor.initials,
        }
      : null

    return {
      id: this.resource.id,
      previousStatus: this.resource.previousStatus,
      nextStatus: this.resource.nextStatus,
      comment: this.resource.comment,
      createdAt: this.resource.createdAt,
      actor,
    }
  }
}
