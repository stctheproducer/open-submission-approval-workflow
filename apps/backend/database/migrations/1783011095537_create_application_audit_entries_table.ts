import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'application_audit_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('application_id').unsigned().references('applications.id').onDelete('CASCADE')
      table.integer('actor_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('from_status').notNullable()
      table.string('to_status').notNullable()
      table.text('comment').notNullable()
      table.timestamp('created_at').notNullable()
      table.index(['application_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
