import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SessionLoginSeeder from '#database/seeders/session_login_seeder'

export default class DatabaseSeeder extends BaseSeeder {
  async run() {
    await new SessionLoginSeeder(this.client).run()
  }
}
