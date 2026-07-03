import { Route, Routes } from "react-router"

import { LoginPage } from "@/pages/login-page"
import {
  ApplicantApplicationPage,
  ApplicantWorkspacePage,
} from "@/pages/applicant-workspace-page"
import {
  ReviewerApplicationPage,
  ReviewerWorkspacePage,
} from "@/pages/reviewer-workspace-page"
import type { Role } from "@/routing/access-policy"
import { ApplicantGuard, LandingRoute, ReviewerGuard } from "@/routing/access-policy"

type AppProps = {
  currentRole?: Role
}

export function App({ currentRole = null }: AppProps) {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute currentRole={currentRole} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ApplicantGuard currentRole={currentRole} />}>
        <Route path="/applicant" element={<ApplicantWorkspacePage />} />
        <Route path="/applicant/applications/:id" element={<ApplicantApplicationPage mode="view" />} />
        <Route
          path="/applicant/applications/:id/edit"
          element={<ApplicantApplicationPage mode="edit" />}
        />
      </Route>
      <Route element={<ReviewerGuard currentRole={currentRole} />}>
        <Route path="/reviewer" element={<ReviewerWorkspacePage />} />
        <Route path="/reviewer/applications/:id" element={<ReviewerApplicationPage />} />
      </Route>
    </Routes>
  )
}

export default App
