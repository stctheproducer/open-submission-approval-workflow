import { useQuery } from "@tanstack/react-query"

import { apiQuery } from "@/lib/query"

export function SessionStatusCard() {
  const sessionQuery = useQuery(apiQuery.profile.profile.show.queryOptions())

  const sessionUser = sessionQuery.data?.data

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 text-slate-100 shadow-xl shadow-slate-950/20 backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200/70">
        Same-origin session
      </p>

      {sessionQuery.isPending ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Checking the browser session cookie against <code>/api/v1/account/profile</code>.
        </p>
      ) : sessionQuery.isSuccess && sessionUser ? (
        <div className="mt-3 space-y-1">
          <p className="text-base font-medium text-white">{sessionUser.fullName}</p>
          <p className="text-sm text-slate-300">{sessionUser.email}</p>
          <p className="text-sm text-slate-300">
            The frontend is reading the authenticated user through Tuyau and React Query.
          </p>
        </div>
      ) : sessionQuery.isSuccess ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The session endpoint responded, but no profile payload was returned.
        </p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-300">
          No active session was found yet. Sign in and the cookie-backed profile request will start
          resolving automatically.
        </p>
      )}
    </section>
  )
}
