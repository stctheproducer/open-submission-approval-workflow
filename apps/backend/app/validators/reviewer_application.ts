import vine from '@vinejs/vine'

export const reviewerApplicationsIndexValidator = vine.create({
  reviewState: vine.enum(['ready', 'owned']).optional(),
  page: vine.number().positive().optional(),
  perPage: vine.number().positive().max(100).optional(),
})
