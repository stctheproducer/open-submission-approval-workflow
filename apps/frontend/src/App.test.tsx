import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import App from "./App"
import { ThemeProvider } from "@/components/theme-provider"

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

function renderAt(path: string) {
  const queryClient = createTestQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

function renderWithRole(path: string, currentRole: "applicant" | "reviewer") {
  const queryClient = createTestQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <App currentRole={currentRole} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }) as typeof fetch,
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
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
      screen.getByRole("heading", { name: "Enter the workflow workspace" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("img", { name: "Illustration of the approval workflow login experience" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByText("Same-origin session")).toBeInTheDocument()
  })

  it("keeps an applicant out of the reviewer area", () => {
    renderWithRole("/reviewer", "applicant")

    expect(
      screen.getByRole("heading", { name: "Enter the workflow workspace" }),
    ).toBeInTheDocument()
  })

  it("shows the session probe fallback when the profile request is unauthorized", async () => {
    renderAt("/")

    expect(
      await screen.findByText(/No active session was found yet/i),
    ).toBeInTheDocument()
  })
})
