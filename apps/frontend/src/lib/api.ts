import { createTuyau } from "@tuyau/core/client"
import { registry } from "@api-starter-kit/backend/registry"

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/"

export const api = createTuyau({
  baseUrl: apiBaseUrl,
  // Session auth lives on the API origin, so cross-origin requests must
  // include browser credentials for the session cookie to be sent.
  credentials: "include",
  registry,
})
