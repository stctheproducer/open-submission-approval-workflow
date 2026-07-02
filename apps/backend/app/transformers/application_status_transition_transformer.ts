import type ApplicationStatusTransition from '#models/application_status_transition'
import UserTransformer from '#transformers/user_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ApplicationStatusTransitionTransformer extends BaseTransformer<ApplicationStatusTransition> {
  toObject() {
    return {
      id: this.resource.id,
      previousStatus: this.resource.previousStatus,
      nextStatus: this.resource.nextStatus,
      comment: this.resource.comment,
      createdAt: this.resource.createdAt,
      actor: this.resource.actor ? UserTransformer.transform(this.resource.actor) : null,
    }
  }
}
