import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import { UserFactory } from '#database/factories/user_factory'
import { ApplicationFactory } from '#database/factories/application_factory'
import { ApplicationStatus } from '#values/application_status'

const validPdf = Buffer.from('%PDF-1.4\n% test pdf\n')
const oversizedFile = Buffer.alloc(6 * 1024 * 1024, 0)

test.group('Application attachments', (group) => {
  group.each.setup(() => testUtils.db('test').truncate())

  test('uploads an attachment to an owned draft application', async ({ client, db }) => {
    using fakeDisk = drive.fake('fs')

    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.DRAFT,
    }).create()

    const response = await client
      .visit('applicant.applications.attachment.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', validPdf, {
        filename: 'supporting-document.pdf',
        contentType: 'application/pdf',
      })

    response.assertStatus(200)
    const body = response.body() as { data: { attachmentUrl?: string | null } }
    if (typeof body.data.attachmentUrl !== 'string' || body.data.attachmentUrl.length === 0) {
      throw new Error(`Expected attachmentUrl, got ${JSON.stringify(body)}`)
    }

    await db.assertHas('applications', { id: application.id })
    await application.refresh()
    if (typeof application.attachmentKey !== 'string' || application.attachmentKey.length === 0) {
      throw new Error(`Expected attachment key on application, got ${application.attachmentKey}`)
    }
    fakeDisk.assertExists(application.attachmentKey)
  })

  test('replaces the current attachment on an owned draft application', async ({ client, db }) => {
    using fakeDisk = drive.fake('fs')

    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.DRAFT,
    }).create()

    const firstUpload = await client
      .visit('applicant.applications.attachment.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', validPdf, {
        filename: 'supporting-document.pdf',
        contentType: 'application/pdf',
      })

    firstUpload.assertStatus(200)
    await application.refresh()
    const oldKey = application.attachmentKey
    if (typeof oldKey !== 'string' || oldKey.length === 0) {
      throw new Error(`Expected first attachment key, got ${oldKey}`)
    }

    const replacement = await client
      .visit('applicant.applications.attachment.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', Buffer.from('%PDF-1.4\n% replacement pdf\n'), {
        filename: 'replacement.pdf',
        contentType: 'application/pdf',
      })

    replacement.assertStatus(200)
    await application.refresh()
    const newKey = application.attachmentKey
    if (typeof newKey !== 'string' || newKey.length === 0) {
      throw new Error(`Expected replacement attachment key, got ${newKey}`)
    }

    if (newKey === oldKey) {
      throw new Error('Expected a new attachment key after replacement')
    }

    fakeDisk.assertExists(newKey)
    fakeDisk.assertMissing(oldKey)
    await db.assertHas('applications', { id: application.id, attachment_key: newKey })
  })

  test('rejects an invalid file type', async ({ client }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.DRAFT,
    }).create()

    const response = await client
      .visit('applicant.applications.attachment.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', Buffer.from('plain text file'), {
        filename: 'not-allowed.txt',
        contentType: 'text/plain',
      })

    response.assertStatus(422)
    const body = response.body() as { errors?: unknown[] }
    if (!body.errors || !Array.isArray(body.errors) || body.errors.length === 0) {
      throw new Error(`Expected errors array, got ${JSON.stringify(body)}`)
    }
  })

  test('rejects an oversized file', async ({ client }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.DRAFT,
    }).create()

    const response = await client
      .visit('applicant.applications.attachment.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', oversizedFile, {
        filename: 'too-large.pdf',
        contentType: 'application/pdf',
      })

    response.assertStatus(422)
    const body = response.body() as { errors?: unknown[] }
    if (!body.errors || !Array.isArray(body.errors) || body.errors.length === 0) {
      throw new Error(`Expected errors array, got ${JSON.stringify(body)}`)
    }
  })

  test('rejects unauthenticated attachment uploads', async ({ client }) => {
    const application = await ApplicationFactory.merge({
      status: ApplicationStatus.DRAFT,
    }).create()

    const response = await client
      .visit('applicant.applications.attachment.store', {
        id: application.id,
      })
      .file('attachment', validPdf, {
        filename: 'supporting-document.pdf',
        contentType: 'application/pdf',
      })

    response.assertStatus(401)
  })

  test('returns 404 for a foreign or missing application', async ({ client }) => {
    const applicant = await UserFactory.create()
    const otherApplicant = await UserFactory.create()
    const foreignApplication = await ApplicationFactory.merge({
      userId: otherApplicant.id,
      status: ApplicationStatus.DRAFT,
    }).create()

    const foreignResponse = await client
      .visit('applicant.applications.attachment.store', { id: foreignApplication.id })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', validPdf, {
        filename: 'supporting-document.pdf',
        contentType: 'application/pdf',
      })

    foreignResponse.assertStatus(404)

    const missingResponse = await client
      .visit('applicant.applications.attachment.store', { id: 999999 })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', validPdf, {
        filename: 'supporting-document.pdf',
        contentType: 'application/pdf',
      })

    missingResponse.assertStatus(404)
  })

  test('rejects attachment changes on a non-draft application', async ({ client }) => {
    const applicant = await UserFactory.create()
    const application = await ApplicationFactory.merge({
      userId: applicant.id,
      status: ApplicationStatus.SUBMITTED,
    }).create()

    const response = await client
      .visit('applicant.applications.attachment.store', { id: application.id })
      .withGuard('web')
      .loginAs(applicant)
      .file('attachment', validPdf, {
        filename: 'supporting-document.pdf',
        contentType: 'application/pdf',
      })

    response.assertStatus(409)
  })
})
