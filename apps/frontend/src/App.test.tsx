import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"

import App from "./App"

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

function renderWithRole(path: string, currentRole: "applicant" | "reviewer") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App currentRole={currentRole} />
    </MemoryRouter>
  )
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe("App routing", () => {
  it("sends an applicant to the applicant area", () => {
    renderWithRole("/", "applicant")

    expect(screen.getByText("Applicant area")).toBeInTheDocument()
  })

  it("sends a reviewer to the reviewer area", () => {
    renderWithRole("/", "reviewer")

    expect(screen.getByText("Reviewer area")).toBeInTheDocument()
  })

  it("keeps unauthenticated users on the sign-in page", () => {
    renderAt("/")

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
  })

  it("keeps an applicant out of the reviewer area", () => {
    renderWithRole("/reviewer", "applicant")

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
  })
})
