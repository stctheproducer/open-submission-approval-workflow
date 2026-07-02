import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import AccessTokensController from '#controllers/access_tokens_controller'
import SessionLoginSeeder, {
  SESSION_LOGIN_SEED_USERS,
} from '#database/seeders/session_login_seeder'

test.group('Session login seed', (group) => {
  group.each.setup(async () => {
    await testUtils.db('test').truncate()
    await new SessionLoginSeeder(db.connection('test')).run()
  })

  test('signs in a seeded applicant through the shared session login and logs out', async ({
    client,
  }) => {
    const applicant = SESSION_LOGIN_SEED_USERS.applicant
    const seededApplicant = await User.query().where('email', applicant.email).firstOrFail()

    const loginResponse = await client.post('/api/v1/auth/login').json({
      email: applicant.email,
      password: applicant.password,
    })

    loginResponse.assertStatus(200)
    loginResponse.assertBodyContains({
      data: {
        user: {
          email: applicant.email,
        },
      },
    })

    const loginBody = loginResponse.body() as { data: { token: string } }
    if (typeof loginBody.data.token !== 'string' || loginBody.data.token.length === 0) {
      throw new Error(`Expected a login token, got ${JSON.stringify(loginBody)}`)
    }

    const logoutResponse = await new AccessTokensController().destroy({
      auth: {
        getUserOrFail: () => seededApplicant,
      },
    } as any)

    if (logoutResponse.message !== 'Logged out successfully') {
      throw new Error(`Expected logout success, got ${JSON.stringify(logoutResponse)}`)
    }
  })

  test('signs in a seeded reviewer through the shared session login and logs out', async ({
    client,
  }) => {
    const reviewer = SESSION_LOGIN_SEED_USERS.reviewer
    const seededReviewer = await User.query().where('email', reviewer.email).firstOrFail()

    const loginResponse = await client.post('/api/v1/auth/login').json({
      email: reviewer.email,
      password: reviewer.password,
    })

    loginResponse.assertStatus(200)
    loginResponse.assertBodyContains({
      data: {
        user: {
          email: reviewer.email,
        },
      },
    })

    const loginBody = loginResponse.body() as { data: { token: string } }
    if (typeof loginBody.data.token !== 'string' || loginBody.data.token.length === 0) {
      throw new Error(`Expected a login token, got ${JSON.stringify(loginBody)}`)
    }

    const logoutResponse = await new AccessTokensController().destroy({
      auth: {
        getUserOrFail: () => seededReviewer,
      },
    } as any)

    if (logoutResponse.message !== 'Logged out successfully') {
      throw new Error(`Expected logout success, got ${JSON.stringify(logoutResponse)}`)
    }
  })

  test('seeds one applicant and one reviewer for local sign-in testing', async ({ db }) => {
    await db.assertHas('users', {
      email: SESSION_LOGIN_SEED_USERS.applicant.email,
      role: SESSION_LOGIN_SEED_USERS.applicant.role,
    })
    await db.assertHas('users', {
      email: SESSION_LOGIN_SEED_USERS.reviewer.email,
      role: SESSION_LOGIN_SEED_USERS.reviewer.role,
    })
  })
})
