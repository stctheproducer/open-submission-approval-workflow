import { useQuery } from "@tanstack/react-query"

import { apiQuery } from "@/lib/query"

export function SessionStatusCard() {
  const sessionQuery = useQuery(
    apiQuery.profile.profile.show.queryOptions(),
  )

  const sessionUser = sessionQuery.data?.data

  return (
    <section className="rounded-2xl border bg-background p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Same-origin session
      </p>

      {sessionQuery.isPending ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Checking the browser session cookie against <code>/api/v1/account/profile</code>.
        </p>
      ) : sessionQuery.isSuccess && sessionUser ? (
        <div className="mt-3 space-y-1">
          <p className="text-base font-medium">{sessionUser.fullName}</p>
          <p className="text-sm text-muted-foreground">{sessionUser.email}</p>
          <p className="text-sm text-muted-foreground">
            The frontend is reading the authenticated user through Tuyau and React Query.
          </p>
        </div>
      ) : sessionQuery.isSuccess ? (
        <p className="mt-3 text-sm text-muted-foreground">
          The session endpoint responded, but no profile payload was returned.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No active session was found yet. Sign in and the cookie-backed profile request will start
          resolving automatically.
        </p>
      )}
    </section>
  )
}
