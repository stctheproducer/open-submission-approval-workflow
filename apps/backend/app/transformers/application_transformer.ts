import type Application from '#models/application'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { ApplicationStatus } from '#values/application_status'

export default class ApplicationTransformer extends BaseTransformer<Application> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'status',
      'organizationName',
      'contactName',
      'contactEmail',
      'createdAt',
      'updatedAt',
    ])
  }

  isEditable() {
    return this.resource.status === ApplicationStatus.DRAFT
  }
}
