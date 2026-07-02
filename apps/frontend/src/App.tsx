import { Route, Routes } from "react-router"

import { LoginPage } from "@/pages/login-page"
import type { Role } from "@/routing/access-policy"
import { ApplicantGuard, LandingRoute, ReviewerGuard } from "@/routing/access-policy"

type AppProps = {
  currentRole?: Role
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
