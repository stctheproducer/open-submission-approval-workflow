import { useQuery } from "@tanstack/react-query"

import { apiQuery } from "@/lib/query"

export function SessionStatusCard() {
  const sessionQuery = useQuery(apiQuery.profile.profile.show.queryOptions())

  const sessionUser = sessionQuery.data?.data

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 text-slate-100 shadow-xl shadow-slate-950/20 backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200/70">
        Session status
      </p>

      {sessionQuery.isPending ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Checking whether you already have an active session.
        </p>
      ) : sessionQuery.isSuccess && sessionUser ? (
        <div className="mt-3 space-y-1">
          <p className="text-base font-medium text-white">{sessionUser.fullName}</p>
          <p className="text-sm text-slate-300">{sessionUser.email}</p>
          <p className="text-sm text-slate-300">
            You are signed in and ready to continue.
          </p>
        </div>
      ) : sessionQuery.isSuccess ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">
          No active session yet. Sign in to continue.
        </p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-300">
          No active session yet. Sign in to continue.
        </p>
      )}
    </section>
  )
}
