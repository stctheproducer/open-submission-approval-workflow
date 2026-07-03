import { useState } from "react"
import { Route, Routes } from "react-router"

import { LoginPage } from "@/pages/login-page"
import {
  ApplicantApplicationPage,
  ApplicantApplicationDraftPage,
  ApplicantWorkspacePage,
} from "@/pages/applicant-workspace-page"
import {
  ReviewerApplicationPage,
  ReviewerWorkspacePage,
} from "@/pages/reviewer-workspace-page"
import type { Role } from "@/routing/access-policy"
import { ApplicantGuard, LandingRoute, ReviewerGuard } from "@/routing/access-policy"
import { readStoredRole, storeRole } from "@/lib/auth-session"

type AppProps = {
  currentRole?: Role
}

export function App({ currentRole }: AppProps) {
  const isControlled = currentRole !== undefined
  const [storedRole, setStoredRole] = useState<Role>(() => readStoredRole())
  const activeRole = currentRole ?? storedRole

  function handleSignedIn(role: Exclude<Role, null>) {
    if (isControlled) {
      return
    }

    storeRole(role)
    setStoredRole(role)
  }

  function handleSignedOut() {
    if (isControlled) {
      return
    }

    storeRole(null)
    setStoredRole(null)
  }

  return (
    <Routes>
      <Route path="/" element={<LandingRoute currentRole={activeRole} />} />
      <Route
        path="/login"
        element={
          <LoginPage currentRole={activeRole} onSignedIn={handleSignedIn} />
        }
      />
      <Route element={<ApplicantGuard currentRole={activeRole} />}>
        <Route
          path="/applicant"
          element={<ApplicantWorkspacePage onSignedOut={handleSignedOut} />}
        />
        <Route
          path="/applicant/applications/new"
          element={<ApplicantApplicationDraftPage onSignedOut={handleSignedOut} />}
        />
        <Route
          path="/applicant/applications/:id"
          element={<ApplicantApplicationPage onSignedOut={handleSignedOut} mode="view" />}
        />
        <Route
          path="/applicant/applications/:id/edit"
          element={<ApplicantApplicationPage onSignedOut={handleSignedOut} mode="edit" />}
        />
      </Route>
      <Route element={<ReviewerGuard currentRole={activeRole} />}>
        <Route
          path="/reviewer"
          element={<ReviewerWorkspacePage onSignedOut={handleSignedOut} />}
        />
        <Route
          path="/reviewer/applications/:id"
          element={<ReviewerApplicationPage onSignedOut={handleSignedOut} />}
        />
      </Route>
    </Routes>
  )
}

export default App
