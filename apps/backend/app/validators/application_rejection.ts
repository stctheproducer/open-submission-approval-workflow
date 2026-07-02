import vine from '@vinejs/vine'

export const rejectApplicationValidator = vine.create({
  comment: vine.string().trim().minLength(1),
})
