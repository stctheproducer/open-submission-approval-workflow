import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'application_status_transitions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('application_id').unsigned().references('applications.id').onDelete('CASCADE')
      table.integer('actor_user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('previous_status').notNullable()
      table.string('next_status').notNullable()
      table.text('comment').nullable()

      table.timestamp('created_at').notNullable()
      table.index(['application_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
