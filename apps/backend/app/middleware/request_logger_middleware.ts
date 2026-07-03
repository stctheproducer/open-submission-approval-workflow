import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import app from '@adonisjs/core/services/app'

export default class RequestLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startTime = process.hrtime()

    const excludedPaths = ['/favicon.ico', '/health']

    try {
      await next()
    } finally {
      if (!(app.inTest || excludedPaths.some((path) => ctx.request.url().includes(path)))) {
        const duration = process.hrtime(startTime)
        const durationMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2)
        const durationSec = (duration[0] + duration[1] / 1e9).toFixed(2)

        const logData = {
          event: 'http_request',
          method: ctx.request.method(),
          url: ctx.request.completeUrl(true),
          route: ctx.route?.pattern,
          statusCode: ctx.response.getStatus(),
          durationMs: Number(durationMs),
          durationSec: Number(durationSec),
          ip: ctx.request.ip(),
          userAgent: ctx.request.header('user-agent'),
          userId: ctx.auth?.user?.id,
        }

        if (ctx.response.getStatus() >= 400) {
          ctx.logger.warn(
            logData,
            `HTTP Request Failed: ${ctx.request.method()} ${ctx.request.url()}`
          )
        } else {
          ctx.logger.info(
            logData,
            `HTTP Request Completed: ${ctx.request.method()} ${ctx.request.url()}`
          )
        }
      }
    }
  }
}
