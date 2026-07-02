import { Route, Routes } from "react-router"

import { LoginPage } from "@/pages/login-page"
import {
  ApplicantApplicationPage,
  ApplicantWorkspacePage,
} from "@/pages/applicant-workspace-page"
import type { Role } from "@/routing/access-policy"
import { ApplicantGuard, LandingRoute, ReviewerGuard } from "@/routing/access-policy"

type AppProps = {
  currentRole?: Role
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
        <Route path="/applicant" element={<ApplicantWorkspacePage />} />
        <Route path="/applicant/applications/:id" element={<ApplicantApplicationPage mode="view" />} />
        <Route
          path="/applicant/applications/:id/edit"
          element={<ApplicantApplicationPage mode="edit" />}
        />
      </Route>
      <Route element={<ReviewerGuard currentRole={currentRole} />}>
        <Route path="/reviewer" element={<ReviewerHome />} />
      </Route>
    </Routes>
  )
}

export default App
