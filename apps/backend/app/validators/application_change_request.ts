import vine from '@vinejs/vine'

export const requestApplicationChangeValidator = vine.create({
  comment: vine.string().trim().minLength(1).maxLength(2000),
})
