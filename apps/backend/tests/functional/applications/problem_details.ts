export function assertProblemDetails(
  body: unknown,
  status: number,
  options?: {
    validation?: boolean
  }
) {
  if (typeof body !== 'object' || body === null) {
    throw new Error(`Expected problem-details object, got ${JSON.stringify(body)}`)
  }

  const record = body as {
    type?: unknown
    title?: unknown
    status?: unknown
    detail?: unknown
    instance?: unknown
    errors?: unknown
  }

  if (record.type !== 'about:blank') {
    throw new Error(`Expected RFC 9457 type "about:blank", got ${JSON.stringify(record)}`)
  }
  if (typeof record.title !== 'string' || record.title.length === 0) {
    throw new Error(`Expected a problem-details title, got ${JSON.stringify(record)}`)
  }
  if (record.status !== status) {
    throw new Error(`Expected status ${status}, got ${JSON.stringify(record)}`)
  }
  if (typeof record.detail !== 'string' || record.detail.length === 0) {
    throw new Error(`Expected a problem-details detail string, got ${JSON.stringify(record)}`)
  }
  if (typeof record.instance !== 'string' || record.instance.length === 0) {
    throw new Error(`Expected a problem-details instance string, got ${JSON.stringify(record)}`)
  }
  if (options?.validation) {
    if (!Array.isArray(record.errors) || record.errors.length === 0) {
      throw new Error(`Expected validation errors extension, got ${JSON.stringify(record)}`)
    }
  } else if ('errors' in record) {
    throw new Error(`Did not expect legacy errors envelope, got ${JSON.stringify(record)}`)
  }
}
