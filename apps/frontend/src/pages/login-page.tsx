import loginIllustration from "@/assets/login-illustration.svg"

export function LoginPage() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,_#050816_0%,_#07111e_100%)] text-slate-100">
      <div className="grid min-h-svh lg:grid-cols-2">
        <section className="relative isolate overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.28),_transparent_28%),radial-gradient(circle_at_80%_80%,_rgba(139,92,246,0.24),_transparent_32%),linear-gradient(145deg,_rgba(255,255,255,0.08),_transparent_36%)]" />
          <div className="relative flex h-full min-h-[32rem] flex-col justify-between gap-8 p-6 sm:p-10 lg:p-12">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200/80">
                Applications
              </p>
              <h1 className="mt-5 max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Manage applications from one place.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Sign in to continue to your dashboard and keep submissions, reviews, and decisions
                moving.
              </p>
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
                  Secure access
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Welcome back
                </h2>
                <p className="max-w-md text-sm leading-6 text-slate-300">
                  Sign in with your work email to access your dashboard.
                </p>
              </div>

              <form className="mt-8 space-y-4" aria-label="Sign in form">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-100" htmlFor="email">
                    Work email
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
                    Keep me signed in
                  </label>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

