/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router
          .resource('applications', controllers.Applications)
          .apiOnly()
          .only(['index', 'store', 'show', 'update'])
        router
          .resource('applications.submissions', controllers.ApplicationSubmissions)
          .only(['store'])
        router.post('applications/:id/reopen', [controllers.ApplicationDraftReopenings, 'store'])
      })
      .prefix('applicant')
      .as('applicant')
      .use(middleware.auth({ guards: ['web'] }))

    router
      .group(() => {
        router.resource('applications', controllers.ReviewerApplications).only(['index', 'show'])
        router.post('applications/:id/review-starts', [
          controllers.ApplicationReviewStarts,
          'store',
        ])
        router
          .post('applications/:applicationId/approvals', [
            controllers.ApplicationApprovals,
            'store',
          ])
          .where('applicationId', router.matchers.number())
        router
          .post('applications/:id/change-request', [
            controllers.ApplicationChangeRequests,
            'store',
          ])
          .where('id', router.matchers.number())
        router
          .post('applications/:application_id/rejections', [
            controllers.ApplicationRejections,
            'store',
          ])
          .where('application_id', router.matchers.number())
      })
      .prefix('reviewer')
      .as('reviewer')
      .use(middleware.auth({ guards: ['web'] }))
  })
  .prefix('/api/v1')
