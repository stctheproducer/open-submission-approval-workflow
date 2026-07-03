import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as bouncerErrors } from '@adonisjs/bouncer'
import { errors as lucidErrors } from '@adonisjs/lucid'

const TITLE_BY_STATUS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Content',
}

function getStatus(error: unknown) {
  if (typeof error === 'object' && error && 'status' in error && typeof error.status === 'number') {
    return error.status
  }

  return null
}

function getMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Request failed'
}

function getValidationErrors(error: unknown) {
  if (error instanceof vineErrors.E_VALIDATION_ERROR) {
    return error.messages.map((message: { field: string; rule: string; message: string }) => ({
      field: message.field,
      rule: message.rule,
      message: message.message,
    }))
  }

  return undefined
}

function getProblemDetails(error: unknown, ctx: HttpContext) {
  const status = getStatus(error)
  if (!status) {
    return null
  }

  if (![400, 401, 403, 404, 409, 422].includes(status)) {
    return null
  }

  return {
    type: 'about:blank',
    title: TITLE_BY_STATUS[status] ?? 'Request failed',
    status,
    detail: getMessage(error),
    instance: ctx.request.url(),
    ...(status === 422 && { errors: getValidationErrors(error) ?? [] }),
  }
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (
      error instanceof Exception ||
      error instanceof vineErrors.E_VALIDATION_ERROR ||
      error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE ||
      error instanceof lucidErrors.E_ROW_NOT_FOUND
    ) {
      const problemDetails = getProblemDetails(error, ctx)
      if (problemDetails) {
        ctx.response.header('Content-Type', 'application/problem+json')
        ctx.response.status(problemDetails.status)
        return ctx.response.send(problemDetails)
      }
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
