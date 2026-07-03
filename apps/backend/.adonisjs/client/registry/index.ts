/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'applicant.applicationOptionSets.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/applicant/application-option-sets',
    tokens: [{"old":"/api/v1/applicant/application-option-sets","type":0,"val":"api","end":""},{"old":"/api/v1/applicant/application-option-sets","type":0,"val":"v1","end":""},{"old":"/api/v1/applicant/application-option-sets","type":0,"val":"applicant","end":""},{"old":"/api/v1/applicant/application-option-sets","type":0,"val":"application-option-sets","end":""}],
    types: placeholder as Registry['applicant.applicationOptionSets.index']['types'],
  },
  'applicant.applications.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/applicant/applications',
    tokens: [{"old":"/api/v1/applicant/applications","type":0,"val":"api","end":""},{"old":"/api/v1/applicant/applications","type":0,"val":"v1","end":""},{"old":"/api/v1/applicant/applications","type":0,"val":"applicant","end":""},{"old":"/api/v1/applicant/applications","type":0,"val":"applications","end":""}],
    types: placeholder as Registry['applicant.applications.index']['types'],
  },
  'applicant.applications.store': {
    methods: ["POST"],
    pattern: '/api/v1/applicant/applications',
    tokens: [{"old":"/api/v1/applicant/applications","type":0,"val":"api","end":""},{"old":"/api/v1/applicant/applications","type":0,"val":"v1","end":""},{"old":"/api/v1/applicant/applications","type":0,"val":"applicant","end":""},{"old":"/api/v1/applicant/applications","type":0,"val":"applications","end":""}],
    types: placeholder as Registry['applicant.applications.store']['types'],
  },
  'applicant.applications.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/applicant/applications/:id',
    tokens: [{"old":"/api/v1/applicant/applications/:id","type":0,"val":"api","end":""},{"old":"/api/v1/applicant/applications/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/applicant/applications/:id","type":0,"val":"applicant","end":""},{"old":"/api/v1/applicant/applications/:id","type":0,"val":"applications","end":""},{"old":"/api/v1/applicant/applications/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['applicant.applications.show']['types'],
  },
  'applicant.applications.update': {
    methods: ["PUT","PATCH"],
    pattern: '/api/v1/applicant/applications/:id',
    tokens: [{"old":"/api/v1/applicant/applications/:id","type":0,"val":"api","end":""},{"old":"/api/v1/applicant/applications/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/applicant/applications/:id","type":0,"val":"applicant","end":""},{"old":"/api/v1/applicant/applications/:id","type":0,"val":"applications","end":""},{"old":"/api/v1/applicant/applications/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['applicant.applications.update']['types'],
  },
  'applicant.applications.submissions.store': {
    methods: ["POST"],
    pattern: '/api/v1/applicant/applications/:application_id/submissions',
    tokens: [{"old":"/api/v1/applicant/applications/:application_id/submissions","type":0,"val":"api","end":""},{"old":"/api/v1/applicant/applications/:application_id/submissions","type":0,"val":"v1","end":""},{"old":"/api/v1/applicant/applications/:application_id/submissions","type":0,"val":"applicant","end":""},{"old":"/api/v1/applicant/applications/:application_id/submissions","type":0,"val":"applications","end":""},{"old":"/api/v1/applicant/applications/:application_id/submissions","type":1,"val":"application_id","end":""},{"old":"/api/v1/applicant/applications/:application_id/submissions","type":0,"val":"submissions","end":""}],
    types: placeholder as Registry['applicant.applications.submissions.store']['types'],
  },
  'applicant.application_draft_reopenings.store': {
    methods: ["POST"],
    pattern: '/api/v1/applicant/applications/:id/reopen',
    tokens: [{"old":"/api/v1/applicant/applications/:id/reopen","type":0,"val":"api","end":""},{"old":"/api/v1/applicant/applications/:id/reopen","type":0,"val":"v1","end":""},{"old":"/api/v1/applicant/applications/:id/reopen","type":0,"val":"applicant","end":""},{"old":"/api/v1/applicant/applications/:id/reopen","type":0,"val":"applications","end":""},{"old":"/api/v1/applicant/applications/:id/reopen","type":1,"val":"id","end":""},{"old":"/api/v1/applicant/applications/:id/reopen","type":0,"val":"reopen","end":""}],
    types: placeholder as Registry['applicant.application_draft_reopenings.store']['types'],
  },
  'reviewer.applications.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/reviewer/applications',
    tokens: [{"old":"/api/v1/reviewer/applications","type":0,"val":"api","end":""},{"old":"/api/v1/reviewer/applications","type":0,"val":"v1","end":""},{"old":"/api/v1/reviewer/applications","type":0,"val":"reviewer","end":""},{"old":"/api/v1/reviewer/applications","type":0,"val":"applications","end":""}],
    types: placeholder as Registry['reviewer.applications.index']['types'],
  },
  'reviewer.applications.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/reviewer/applications/:id',
    tokens: [{"old":"/api/v1/reviewer/applications/:id","type":0,"val":"api","end":""},{"old":"/api/v1/reviewer/applications/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/reviewer/applications/:id","type":0,"val":"reviewer","end":""},{"old":"/api/v1/reviewer/applications/:id","type":0,"val":"applications","end":""},{"old":"/api/v1/reviewer/applications/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['reviewer.applications.show']['types'],
  },
  'reviewer.application_review_starts.store': {
    methods: ["POST"],
    pattern: '/api/v1/reviewer/applications/:id/review-starts',
    tokens: [{"old":"/api/v1/reviewer/applications/:id/review-starts","type":0,"val":"api","end":""},{"old":"/api/v1/reviewer/applications/:id/review-starts","type":0,"val":"v1","end":""},{"old":"/api/v1/reviewer/applications/:id/review-starts","type":0,"val":"reviewer","end":""},{"old":"/api/v1/reviewer/applications/:id/review-starts","type":0,"val":"applications","end":""},{"old":"/api/v1/reviewer/applications/:id/review-starts","type":1,"val":"id","end":""},{"old":"/api/v1/reviewer/applications/:id/review-starts","type":0,"val":"review-starts","end":""}],
    types: placeholder as Registry['reviewer.application_review_starts.store']['types'],
  },
  'reviewer.application_approvals.store': {
    methods: ["POST"],
    pattern: '/api/v1/reviewer/applications/:applicationId/approvals',
    tokens: [{"old":"/api/v1/reviewer/applications/:applicationId/approvals","type":0,"val":"api","end":""},{"old":"/api/v1/reviewer/applications/:applicationId/approvals","type":0,"val":"v1","end":""},{"old":"/api/v1/reviewer/applications/:applicationId/approvals","type":0,"val":"reviewer","end":""},{"old":"/api/v1/reviewer/applications/:applicationId/approvals","type":0,"val":"applications","end":""},{"old":"/api/v1/reviewer/applications/:applicationId/approvals","type":1,"val":"applicationId","end":""},{"old":"/api/v1/reviewer/applications/:applicationId/approvals","type":0,"val":"approvals","end":""}],
    types: placeholder as Registry['reviewer.application_approvals.store']['types'],
  },
  'reviewer.application_change_requests.store': {
    methods: ["POST"],
    pattern: '/api/v1/reviewer/applications/:id/change-request',
    tokens: [{"old":"/api/v1/reviewer/applications/:id/change-request","type":0,"val":"api","end":""},{"old":"/api/v1/reviewer/applications/:id/change-request","type":0,"val":"v1","end":""},{"old":"/api/v1/reviewer/applications/:id/change-request","type":0,"val":"reviewer","end":""},{"old":"/api/v1/reviewer/applications/:id/change-request","type":0,"val":"applications","end":""},{"old":"/api/v1/reviewer/applications/:id/change-request","type":1,"val":"id","end":""},{"old":"/api/v1/reviewer/applications/:id/change-request","type":0,"val":"change-request","end":""}],
    types: placeholder as Registry['reviewer.application_change_requests.store']['types'],
  },
  'reviewer.application_rejections.store': {
    methods: ["POST"],
    pattern: '/api/v1/reviewer/applications/:application_id/rejections',
    tokens: [{"old":"/api/v1/reviewer/applications/:application_id/rejections","type":0,"val":"api","end":""},{"old":"/api/v1/reviewer/applications/:application_id/rejections","type":0,"val":"v1","end":""},{"old":"/api/v1/reviewer/applications/:application_id/rejections","type":0,"val":"reviewer","end":""},{"old":"/api/v1/reviewer/applications/:application_id/rejections","type":0,"val":"applications","end":""},{"old":"/api/v1/reviewer/applications/:application_id/rejections","type":1,"val":"application_id","end":""},{"old":"/api/v1/reviewer/applications/:application_id/rejections","type":0,"val":"rejections","end":""}],
    types: placeholder as Registry['reviewer.application_rejections.store']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
