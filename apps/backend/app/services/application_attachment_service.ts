import db from '@adonisjs/lucid/services/db'
import drive from '@adonisjs/drive/services/main'
import string from '@adonisjs/core/helpers/string'
import { inject } from '@adonisjs/core'
import Application from '#models/application'

@inject()
export default class ApplicationAttachmentService {
  async replace(application: Application, attachment: any) {
    return db.transaction(async (trx) => {
      application.useTransaction(trx)

      const previousAttachmentKey = application.attachmentKey
      const key = `applications/${application.id}/attachments/${string.uuid()}.${attachment.extname}`

      await attachment.moveToDisk(key)

      application.attachmentKey = key
      await application.save()

      trx.after('commit', async () => {
        if (previousAttachmentKey) {
          await drive.use().delete(previousAttachmentKey)
        }
      })

      return application
    })
  }
}
