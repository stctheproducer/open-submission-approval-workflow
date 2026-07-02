import { createTuyauReactQueryClient } from "@tuyau/react-query"

import { api } from "@/lib/api"

export const apiQuery = createTuyauReactQueryClient({
  client: api,
})

