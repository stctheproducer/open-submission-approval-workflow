import { Navigate, Outlet } from "react-router"

export type Role = "applicant" | "reviewer" | null

export function LandingRoute({ currentRole }: { currentRole: Role }) {
  if (currentRole === "applicant") {
    return <Navigate to="/applicant" replace />
  }

  if (currentRole === "reviewer") {
    return <Navigate to="/reviewer" replace />
  }

  return <Navigate to="/login" replace />
}

export function ApplicantGuard({ currentRole }: { currentRole: Role }) {
  if (currentRole !== "applicant") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function ReviewerGuard({ currentRole }: { currentRole: Role }) {
  if (currentRole !== "reviewer") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
