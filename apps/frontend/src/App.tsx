import { Navigate, Outlet, Route, Routes } from "react-router"

import { SessionStatusCard } from "@/components/session-status-card"

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
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="flex w-full max-w-md flex-col gap-4">
        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the shared session login for either applicant or reviewer access.
          </p>
        </div>

        <SessionStatusCard />
      </section>
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
