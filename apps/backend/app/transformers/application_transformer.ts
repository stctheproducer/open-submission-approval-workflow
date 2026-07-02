import type Application from '#models/application'
import type ApplicationAuditLogEntry from '#models/application_audit_log_entry'
import UserTransformer from '#transformers/user_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { ApplicationStatus } from '#values/application_status'

export default class ApplicationTransformer extends BaseTransformer<Application> {
  toObject() {
    const history = this.resource.auditLogEntries ?? []
    return {
      id: this.resource.id,
      status: this.resource.status,
      organizationName: this.resource.organizationName,
      contactName: this.resource.contactName,
      contactEmail: this.resource.contactEmail,
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,
      history: history.map((entry) => serializeApplicationAuditLogEntry(entry)),
    }
  }

  isEditable() {
    return this.resource.status === ApplicationStatus.DRAFT
  }
}

function serializeApplicationAuditLogEntry(resource: ApplicationAuditLogEntry) {
  return {
    id: resource.id,
    previousStatus: resource.previousStatus,
    nextStatus: resource.nextStatus,
    comment: resource.comment,
    recordedAt: {
      raw: resource.createdAt.toISO(),
      formatted: resource.createdAt.toFormat('yyyy-LL-dd HH:mm'),
    },
    performedBy: resource.actor ? UserTransformer.transform(resource.actor) : null,
  }
}
