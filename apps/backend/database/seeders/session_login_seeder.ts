import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const SESSION_LOGIN_SEED_USERS = {
  applicant: {
    fullName: 'Seeded Applicant',
    email: 'applicant@example.com',
    password: 'password1234',
    role: 'applicant' as const,
  },
  reviewer: {
    fullName: 'Seeded Reviewer',
    email: 'reviewer@example.com',
    password: 'password1234',
    role: 'reviewer' as const,
  },
}

export default class SessionLoginSeeder extends BaseSeeder {
  async run() {
    for (const user of Object.values(SESSION_LOGIN_SEED_USERS)) {
      await User.updateOrCreate(
        { email: user.email },
        {
          fullName: user.fullName,
          email: user.email,
          password: user.password,
          role: user.role,
        }
      )
    }
  }
}
