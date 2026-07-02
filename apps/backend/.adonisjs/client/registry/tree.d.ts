/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  applicant: {
    applications: {
      index: typeof routes['applicant.applications.index']
      store: typeof routes['applicant.applications.store']
      show: typeof routes['applicant.applications.show']
      update: typeof routes['applicant.applications.update']
      submissions: {
        store: typeof routes['applicant.applications.submissions.store']
      }
    }
    applicationDraftReopenings: {
      store: typeof routes['applicant.application_draft_reopenings.store']
    }
  }
  reviewer: {
    applications: {
      index: typeof routes['reviewer.applications.index']
      show: typeof routes['reviewer.applications.show']
    }
    applicationReviewStarts: {
      store: typeof routes['reviewer.application_review_starts.store']
    }
    applicationApprovals: {
      store: typeof routes['reviewer.application_approvals.store']
    }
    applicationChangeRequests: {
      store: typeof routes['reviewer.application_change_requests.store']
    }
    applicationRejections: {
      store: typeof routes['reviewer.application_rejections.store']
    }
  }
}
