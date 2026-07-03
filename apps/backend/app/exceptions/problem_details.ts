import { errors as vineErrors } from '@vinejs/vine'

const TITLE_BY_STATUS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Content',
}

export function getProblemDetails(error: unknown, instance = 'about:blank') {
  const status =
    typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
      ? error.status
      : null

  if (!status || ![400, 401, 403, 404, 409, 422].includes(status)) {
    return null
  }

  const detail =
    typeof error === 'object' && error && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'Request failed'

  return {
    type: 'about:blank',
    title: TITLE_BY_STATUS[status] ?? 'Request failed',
    status,
    detail,
    instance,
    ...(status === 422 && {
      errors:
        error instanceof vineErrors.E_VALIDATION_ERROR
          ? error.messages.map((message: { field: string; rule: string; message: string }) => ({
              field: message.field,
              rule: message.rule,
              message: message.message,
            }))
          : [],
    }),
  }
}
