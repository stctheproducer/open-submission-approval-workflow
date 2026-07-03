/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'applicant.applicationOptionSets.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/applicant/application-option-sets'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_option_sets_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_option_sets_controller').default['index']>>>
    }
  }
  'applicant.applications.attachment.store': {
    methods: ["POST"]
    pattern: '/api/v1/applicant/applications/:id/attachment'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/application_attachment').applicationAttachmentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/application_attachment').applicationAttachmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_attachments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_attachments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'applicant.applications.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/applicant/applications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['index']>>>
    }
  }
  'applicant.applications.store': {
    methods: ["POST"]
    pattern: '/api/v1/applicant/applications'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/application').createApplicationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/application').createApplicationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'applicant.applications.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/applicant/applications/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['show']>>>
    }
  }
  'applicant.applications.update': {
    methods: ["PUT","PATCH"]
    pattern: '/api/v1/applicant/applications/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/application').updateApplicationValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/application').updateApplicationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'applicant.applications.submissions.store': {
    methods: ["POST"]
    pattern: '/api/v1/applicant/applications/:application_id/submissions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { application_id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_submissions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_submissions_controller').default['store']>>>
    }
  }
  'applicant.application_draft_reopenings.store': {
    methods: ["POST"]
    pattern: '/api/v1/applicant/applications/:id/reopen'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_draft_reopenings_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_draft_reopenings_controller').default['store']>>>
    }
  }
  'reviewer.applications.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/reviewer/applications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/reviewer_application').reviewerApplicationsIndexValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reviewer_applications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reviewer_applications_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reviewer.applications.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/reviewer/applications/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reviewer_applications_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reviewer_applications_controller').default['show']>>>
    }
  }
  'reviewer.application_review_starts.store': {
    methods: ["POST"]
    pattern: '/api/v1/reviewer/applications/:id/review-starts'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_review_starts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_review_starts_controller').default['store']>>>
    }
  }
  'reviewer.application_approvals.store': {
    methods: ["POST"]
    pattern: '/api/v1/reviewer/applications/:applicationId/approvals'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { applicationId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_approvals_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_approvals_controller').default['store']>>>
    }
  }
  'reviewer.application_change_requests.store': {
    methods: ["POST"]
    pattern: '/api/v1/reviewer/applications/:id/change-request'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/application_change_request').requestApplicationChangeValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/application_change_request').requestApplicationChangeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_change_requests_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_change_requests_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reviewer.application_rejections.store': {
    methods: ["POST"]
    pattern: '/api/v1/reviewer/applications/:application_id/rejections'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/application_rejection').rejectApplicationValidator)>>
      paramsTuple: [ParamValue]
      params: { application_id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/application_rejection').rejectApplicationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/application_rejections_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/application_rejections_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
