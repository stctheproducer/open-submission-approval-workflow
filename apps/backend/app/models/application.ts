import { ApplicationSchema } from '#database/schema'
import { belongsTo, hasMany, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ApplicationAuditLogEntry from '#models/application_audit_log_entry'
import { ApplicationStatus } from '#values/application_status'

export default class Application extends ApplicationSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'assignedReviewerId' })
  declare assignedReviewer: BelongsTo<typeof User>

  @hasMany(() => ApplicationAuditLogEntry)
  declare auditLogEntries: HasMany<typeof ApplicationAuditLogEntry>

  get isDraft() {
    return this.status === 'draft'
  }

  static reviewQueue = scope(
    (query: any, reviewerId: number, reviewState?: 'ready' | 'owned') => {
      query.where((builder: any) => {
        if (reviewState === 'ready') {
          builder
            .where('status', ApplicationStatus.SUBMITTED)
            .whereNull('assignedReviewerId')
        } else if (reviewState === 'owned') {
          builder
            .where('status', ApplicationStatus.UNDER_REVIEW)
            .where('assignedReviewerId', reviewerId)
        } else {
          builder.where((nested: any) => {
            nested
              .where((readyQuery: any) => {
                readyQuery
                  .where('status', ApplicationStatus.SUBMITTED)
                  .whereNull('assignedReviewerId')
              })
              .orWhere((ownedQuery: any) => {
                ownedQuery
                  .where('status', ApplicationStatus.UNDER_REVIEW)
                  .where('assignedReviewerId', reviewerId)
              })
          })
        }
      })
    }
  )
}
