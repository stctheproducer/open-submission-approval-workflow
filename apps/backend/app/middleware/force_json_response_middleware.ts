import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { getProblemDetails } from '#exceptions/problem_details'

export default class ForceJsonResponseMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.request.request.headers.accept = 'application/json'

    try {
      return await next()
    } catch (error) {
      const problemDetails = getProblemDetails(error, ctx.request.url())
      if (problemDetails) {
        ctx.response.header('Content-Type', 'application/problem+json')
        ctx.response.status(problemDetails.status)
        return ctx.response.send(problemDetails)
      }

      throw error
    }
  }
}
