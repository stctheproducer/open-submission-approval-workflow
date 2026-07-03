import type { Role } from "@/routing/access-policy"

const AUTH_ROLE_STORAGE_KEY = "open-submission-auth-role"

export function readStoredRole(): Role {
  if (typeof window === "undefined") {
    return null
  }

  const storedRole = window.localStorage.getItem(AUTH_ROLE_STORAGE_KEY)
  if (storedRole === "applicant" || storedRole === "reviewer") {
    return storedRole
  }

  return null
}

export function storeRole(role: Role) {
  if (typeof window === "undefined") {
    return
  }

  if (role === null) {
    window.localStorage.removeItem(AUTH_ROLE_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_ROLE_STORAGE_KEY, role)
}
