import vine from '@vinejs/vine'

export const applicationAttachmentValidator = vine.create({
  attachment: vine.file({
    extnames: ['pdf', 'png', 'jpeg', 'docx'],
    size: '5mb',
  }),
})
