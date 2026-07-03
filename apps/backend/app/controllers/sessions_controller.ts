import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import AuthenticatedUserTransformer from '#transformers/authenticated_user_transformer'

export default class SessionsController {
  async store({ request, auth, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    if (!user.role) {
      throw new Exception('Invalid user credentials', {
        status: 400,
        code: 'E_INVALID_CREDENTIALS',
      })
    }

    await auth.use('web').login(user)

    return serialize.withoutWrapping({
      user: AuthenticatedUserTransformer.transform(user),
    })
  }

  async destroy({ auth, serialize }: HttpContext) {
    await auth.use('web').logout()

    return serialize.withoutWrapping({
      message: 'Logged out successfully',
    })
  }
}
