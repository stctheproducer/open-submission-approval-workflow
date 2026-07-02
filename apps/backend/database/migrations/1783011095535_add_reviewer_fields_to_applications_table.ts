import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'applications'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('assigned_reviewer_id')
        .unsigned()
        .nullable()
        .references('users.id')
        .onDelete('SET NULL')
      table.string('title').nullable()
      table.string('category').nullable()
      table.text('description').nullable()
      table.decimal('amount', 12, 2).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('assigned_reviewer_id')
      table.dropColumn('title')
      table.dropColumn('category')
      table.dropColumn('description')
      table.dropColumn('amount')
    })
  }
}
