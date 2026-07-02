import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { PropsWithChildren } from "react"
import { useState } from "react"

const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createAppQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

