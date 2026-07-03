import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'applicant.applicationOptionSets.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.attachment.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applicant.applications.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.store': { paramsTuple?: []; params?: {} }
    'applicant.applications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applicant.applications.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applicant.applications.submissions.store': { paramsTuple: [ParamValue]; params: {'application_id': ParamValue} }
    'applicant.application_draft_reopenings.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.applications.index': { paramsTuple?: []; params?: {} }
    'reviewer.applications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.application_review_starts.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.application_approvals.store': { paramsTuple: [ParamValue]; params: {'applicationId': ParamValue} }
    'reviewer.application_change_requests.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.application_rejections.store': { paramsTuple: [ParamValue]; params: {'application_id': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'applicant.applicationOptionSets.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.applications.index': { paramsTuple?: []; params?: {} }
    'reviewer.applications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'applicant.applicationOptionSets.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.applications.index': { paramsTuple?: []; params?: {} }
    'reviewer.applications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'applicant.applications.attachment.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applicant.applications.store': { paramsTuple?: []; params?: {} }
    'applicant.applications.submissions.store': { paramsTuple: [ParamValue]; params: {'application_id': ParamValue} }
    'applicant.application_draft_reopenings.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.application_review_starts.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.application_approvals.store': { paramsTuple: [ParamValue]; params: {'applicationId': ParamValue} }
    'reviewer.application_change_requests.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviewer.application_rejections.store': { paramsTuple: [ParamValue]; params: {'application_id': ParamValue} }
  }
  PUT: {
    'applicant.applications.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'applicant.applications.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}