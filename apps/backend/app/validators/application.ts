import vine from '@vinejs/vine'
import { APPLICATION_CATEGORY_VALUES } from '#values/application_category_options'

/**
 * Validator to use when creating a draft application
 */
export const createApplicationValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(255),
  category: vine.enum(APPLICATION_CATEGORY_VALUES),
  description: vine.string().trim().minLength(1),
  amount: vine.number().decimal(2).positive(),
})

/**
 * Validator to use when updating a draft application
 */
export const updateApplicationValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(255).optional(),
  category: vine.enum(APPLICATION_CATEGORY_VALUES).optional(),
  description: vine.string().trim().minLength(1).optional(),
  amount: vine.number().decimal(2).positive().optional(),
})
