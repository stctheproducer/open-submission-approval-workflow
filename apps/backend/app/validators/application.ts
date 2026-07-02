import vine from '@vinejs/vine'

/**
 * Validator to use when creating a draft application
 */
export const createApplicationValidator = vine.create({
  contactEmail: vine.string().email().nullable().optional(),
})

/**
 * Validator to use when updating a draft application
 */
export const updateApplicationValidator = vine.create({
  organizationName: vine.string().nullable().optional(),
  contactName: vine.string().nullable().optional(),
  contactEmail: vine.string().email().nullable().optional(),
})
