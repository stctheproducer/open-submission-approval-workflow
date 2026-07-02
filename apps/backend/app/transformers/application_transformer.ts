import type Application from '#models/application'
import ApplicationStatusTransitionTransformer from '#transformers/application_status_transition_transformer'
import UserTransformer from '#transformers/user_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { ApplicationStatus } from '#values/application_status'

export default class ApplicationTransformer extends BaseTransformer<Application> {
  toObject() {
    const transitions =
      this.resource.statusTransitions && this.resource.statusTransitions.length > 0
        ? this.resource.statusTransitions
        : this.resource.auditLogEntries ?? []
    return {
      id: this.resource.id,
      title: this.resource.title ?? this.resource.organizationName,
      category: this.resource.category,
      description: this.resource.description,
      amount: this.resource.amount,
      status: this.resource.status,
      organizationName: this.resource.organizationName,
      contactName: this.resource.contactName,
      contactEmail: this.resource.contactEmail,
      applicant: this.resource.user ? UserTransformer.transform(this.resource.user) : null,
      assignedReviewer: this.resource.assignedReviewer
        ? UserTransformer.transform(this.resource.assignedReviewer)
        : null,
      reviewer: this.resource.assignedReviewer
        ? UserTransformer.transform(this.resource.assignedReviewer)
        : null,
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,
      reviewState: this.resource.assignedReviewerId
        ? this.resource.assignedReviewerId === this.resource.assignedReviewer?.id
          ? 'owned'
          : 'other'
          : this.resource.status === ApplicationStatus.SUBMITTED
            ? 'ready'
            : 'other',
      statusTransitions: ApplicationStatusTransitionTransformer.transform(transitions),
      history: ApplicationStatusTransitionTransformer.transform(transitions),
    }
  }

  isEditable() {
    return this.resource.status === ApplicationStatus.DRAFT
  }

  async forDetailedView() {
    return this.toObject()
  }
}
