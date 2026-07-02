import { Navigate, Outlet, Route, Routes } from "react-router"

import { SessionStatusCard } from "@/components/session-status-card"
import loginIllustration from "@/assets/login-illustration.svg"

type Role = "applicant" | "reviewer" | null

type AppProps = {
  currentRole?: Role
}

function LandingRoute({ currentRole }: { currentRole: Role }) {
  if (currentRole === "applicant") {
    return <Navigate to="/applicant" replace />
  }

  if (currentRole === "reviewer") {
    return <Navigate to="/reviewer" replace />
  }

  return <Navigate to="/login" replace />
}

function LoginPage() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,_#050816_0%,_#07111e_100%)] text-slate-100">
      <div className="grid min-h-svh lg:grid-cols-2">
        <section className="relative isolate overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.28),_transparent_28%),radial-gradient(circle_at_80%_80%,_rgba(139,92,246,0.24),_transparent_32%),linear-gradient(145deg,_rgba(255,255,255,0.08),_transparent_36%)]" />
          <div className="relative flex h-full min-h-[32rem] flex-col justify-between gap-8 p-6 sm:p-10 lg:p-12">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200/80">
                Assignment B
              </p>
              <h1 className="mt-5 max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                A cleaner way to sign in and move through the approval workflow.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Use the same-origin session flow from day one. The browser keeps the cookie,
                Tuyau reads the backend registry, and the app stays aligned with the workflow
                vocabulary.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">
                  Session
                </p>
                <p className="mt-2 text-sm text-slate-100">Cookie-backed</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">
                  API
                </p>
                <p className="mt-2 text-sm text-slate-100">Type-safe Tuyau</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">
                  Roles
                </p>
                <p className="mt-2 text-sm text-slate-100">Applicant and reviewer</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 shadow-2xl shadow-cyan-950/20">
              <img
                src={loginIllustration}
                alt="Illustration of the approval workflow login experience"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-lg space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200/80">
                  Sign in
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Enter the workflow workspace
                </h2>
                <p className="max-w-md text-sm leading-6 text-slate-300">
                  Use the shared session login for either applicant or reviewer access.
                </p>
              </div>

              <form className="mt-8 space-y-4" aria-label="Sign in form">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-100" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-100" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="inline-flex items-center gap-3 text-slate-300">
                    <input
                      type="checkbox"
                      name="remember"
                      className="size-4 rounded border-white/20 bg-transparent text-cyan-400 focus:ring-cyan-300/20"
                    />
                    Remember this device
                  </label>

                  <span className="text-slate-400">Sessions stay same-origin.</span>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                >
                  Sign in
                </button>
              </form>
            </div>

            <SessionStatusCard />
          </div>
        </section>
      </div>
    </main>
  )
}

function ApplicantGuard({ currentRole }: { currentRole: Role }) {
  if (currentRole !== "applicant") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function ReviewerGuard({ currentRole }: { currentRole: Role }) {
  if (currentRole !== "reviewer") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function ApplicantHome() {
  return <section>Applicant area</section>
}

function ReviewerHome() {
  return <section>Reviewer area</section>
}

export function App({ currentRole = null }: AppProps) {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute currentRole={currentRole} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ApplicantGuard currentRole={currentRole} />}>
        <Route path="/applicant" element={<ApplicantHome />} />
      </Route>
      <Route element={<ReviewerGuard currentRole={currentRole} />}>
        <Route path="/reviewer" element={<ReviewerHome />} />
      </Route>
    </Routes>
  )
}

export default App
