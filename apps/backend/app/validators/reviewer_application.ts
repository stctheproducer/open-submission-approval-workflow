import vine from '@vinejs/vine'

export const reviewerApplicationsIndexValidator = vine.create({
  reviewState: vine.enum(['ready', 'owned']).optional(),
})
