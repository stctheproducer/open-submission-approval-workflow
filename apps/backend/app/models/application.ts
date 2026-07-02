import { ApplicationSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ApplicationAuditLogEntry from '#models/application_audit_log_entry'

export default class Application extends ApplicationSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ApplicationAuditLogEntry)
  declare auditLogEntries: HasMany<typeof ApplicationAuditLogEntry>

  get isDraft() {
    return this.status === 'draft'
  }
}
