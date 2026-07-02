import { createTuyau } from "@tuyau/core/client"
import { registry } from "@api-starter-kit/backend/registry"

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api"

export const api = createTuyau({
  baseUrl: apiBaseUrl,
  registry,
})

