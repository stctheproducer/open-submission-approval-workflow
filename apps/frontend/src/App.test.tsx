import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"

import App from "./App"
import { ThemeProvider } from "@/components/theme-provider"

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

function renderWithRole(path: string, currentRole: "applicant" | "reviewer") {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App currentRole={currentRole} />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

afterEach(() => {
  cleanup()
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

    expect(
      screen.getByRole("heading", { name: "Sign in to continue." }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("img", { name: "A preview of the application workspace" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Work email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Switch theme, current system theme" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Applicants")).toBeInTheDocument()
    expect(screen.getByText("Reviewers")).toBeInTheDocument()
    expect(screen.getByText("Need help? Contact support.")).toBeInTheDocument()
  })

  it("shows a form error when sign in is attempted without credentials", () => {
    renderAt("/")

    fireEvent.click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter your email and password to continue.",
    )
  })

  it("keeps an applicant out of the reviewer area", () => {
    renderWithRole("/reviewer", "applicant")

    expect(
      screen.getByRole("heading", { name: "Sign in to continue." }),
    ).toBeInTheDocument()
  })

  it("does not render the removed session status card", () => {
    renderAt("/")

    expect(screen.queryByText("Session status")).not.toBeInTheDocument()
  })
})
