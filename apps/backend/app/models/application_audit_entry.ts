import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Application from '#models/application'
import User from '#models/user'

export default class ApplicationAuditEntry extends BaseModel {
  static table = 'application_audit_entries'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare applicationId: number

  @column()
  declare actorId: number

  @column()
  declare fromStatus: string

  @column()
  declare toStatus: string

  @column()
  declare comment: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Application, { foreignKey: 'applicationId' })
  declare application: BelongsTo<typeof Application>

  @belongsTo(() => User, { foreignKey: 'actorId' })
  declare actor: BelongsTo<typeof User>
}
