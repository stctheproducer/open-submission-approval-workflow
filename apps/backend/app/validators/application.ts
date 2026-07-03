import vine from '@vinejs/vine'
import { APPLICATION_CATEGORY_VALUES } from '#values/application_category_options'

/**
 * Validator to use when creating a draft application
 */
export const createApplicationValidator = vine.create({
  contactEmail: vine.string().email().nullable().optional(),
  category: vine.enum(APPLICATION_CATEGORY_VALUES).nullable().optional(),
})

/**
 * Validator to use when updating a draft application
 */
export const updateApplicationValidator = vine.create({
  organizationName: vine.string().nullable().optional(),
  contactName: vine.string().nullable().optional(),
  contactEmail: vine.string().email().nullable().optional(),
  category: vine.enum(APPLICATION_CATEGORY_VALUES).nullable().optional(),
})
