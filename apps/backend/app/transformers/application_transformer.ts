import type Application from '#models/application'
import ApplicationStatusTransitionTransformer from '#transformers/application_status_transition_transformer'
import UserTransformer from '#transformers/user_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'
import drive from '@adonisjs/drive/services/main'
import { ApplicationStatus } from '#values/application_status'

export default class ApplicationTransformer extends BaseTransformer<Application> {
  async toObject() {
    const transitions = this.resource.statusTransitions ?? []
    const attachmentUrl = this.resource.attachmentKey
      ? await drive.use().getUrl(this.resource.attachmentKey)
      : null
    return {
      id: this.resource.id,
      title: this.resource.title,
      category: this.resource.category,
      description: this.resource.description,
      amount: this.resource.amount,
      status: this.resource.status,
      applicant: this.resource.user ? UserTransformer.transform(this.resource.user) : null,
      assignedReviewer: this.resource.assignedReviewer
        ? UserTransformer.transform(this.resource.assignedReviewer)
        : null,
      reviewer: this.resource.assignedReviewer
        ? UserTransformer.transform(this.resource.assignedReviewer)
        : null,
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,
      attachmentUrl,
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
