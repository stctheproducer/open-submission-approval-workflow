import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import SessionLoginSeeder, {
  SESSION_LOGIN_SEED_USERS,
} from '#database/seeders/session_login_seeder'
import { assertProblemDetails } from '../applications/problem_details.js'

test.group('Session login seed', (group) => {
  group.each.setup(async () => {
    await testUtils.db('test').truncate()
    await new SessionLoginSeeder(db.connection('test')).run()
  })

  test('signs in a seeded {role} through the shared session login and sets a session cookie')
    .with([
      SESSION_LOGIN_SEED_USERS.applicant,
      SESSION_LOGIN_SEED_USERS.reviewer,
    ])
    .run(async ({ client }, user) => {
      const loginResponse = await client.visit('auth.sessions.store').json({
        email: user.email,
        password: user.password,
      })

      loginResponse.assertStatus(200)
      loginResponse.assertBodyContains({
        user: {
          email: user.email,
          role: user.role,
        },
      })

      const loginBody = loginResponse.body() as {
        user?: { email?: string; role?: string }
        token?: string
      }
      if (typeof loginBody.token !== 'undefined') {
        throw new Error(`Expected no login token, got ${JSON.stringify(loginBody)}`)
      }

      const sessionCookie = loginResponse.cookie('adonis-session')
      if (!sessionCookie) {
        throw new Error('Expected the login response to set the adonis-session cookie')
      }
    })

  test('rejects invalid credentials without signing the user in', async ({ client }) => {
    const user = SESSION_LOGIN_SEED_USERS.applicant

    const response = await client.visit('auth.sessions.store').json({
      email: user.email,
      password: 'incorrect-password',
    })

    response.assertStatus(400)
    assertProblemDetails(response.body(), 400)
  })

  test('returns the current authenticated user with role after a web-session login', async ({
    client,
  }) => {
    const user = SESSION_LOGIN_SEED_USERS.applicant
    const authenticatedUser = await User.findByOrFail('email', user.email)

    const response = await client
      .visit('profile.profile.show')
      .withGuard('web')
      .loginAs(authenticatedUser)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        email: user.email,
        role: user.role,
      },
    })
  })

  test('rejects unauthenticated profile lookup', async ({ client }) => {
    const response = await client.visit('profile.profile.show')

    response.assertStatus(401)
    assertProblemDetails(response.body(), 401)
  })

  test('logs out an authenticated web-session user', async ({ client }) => {
    const user = SESSION_LOGIN_SEED_USERS.reviewer
    const authenticatedUser = await User.findByOrFail('email', user.email)

    const response = await client
      .visit('profile.sessions.destroy')
      .withGuard('web')
      .loginAs(authenticatedUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Logged out successfully',
    })
  })

  test('seeds one applicant and one reviewer for local sign-in testing', async ({ db: testDb }) => {
    await testDb.assertHas('users', {
      email: SESSION_LOGIN_SEED_USERS.applicant.email,
      role: SESSION_LOGIN_SEED_USERS.applicant.role,
    })
    await testDb.assertHas('users', {
      email: SESSION_LOGIN_SEED_USERS.reviewer.email,
      role: SESSION_LOGIN_SEED_USERS.reviewer.role,
    })
  })
})
