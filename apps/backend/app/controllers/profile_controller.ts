import AuthenticatedUserTransformer from '#transformers/authenticated_user_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    return serialize(AuthenticatedUserTransformer.transform(auth.getUserOrFail()))
  }
}
