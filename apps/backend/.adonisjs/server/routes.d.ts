import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'applicant.applications.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'applicant.applications.index': { paramsTuple?: []; params?: {} }
    'applicant.applications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'applicant.applications.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'applicant.applications.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
  }
  PATCH: {
    'applicant.applications.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}
