import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import App from "./App"
import { api } from "@/lib/api"
import { AppProviders } from "@/providers"
import { ThemeProvider } from "@/components/theme-provider"

const listResponse = {
  data: [
    {
      id: 42,
      title: "Northwind Mutual",
      organizationName: "Northwind Mutual",
      contactName: "Jane Doe",
      contactEmail: "jane@northwind.test",
      category: "Operations",
      description: "Expand the customer support desk.",
      amount: 125000,
      status: "draft",
      history: [],
      statusTransitions: [],
      createdAt: "2026-07-01T09:00:00.000Z",
      updatedAt: "2026-07-02T11:30:00.000Z",
    },
    {
      id: 7,
      title: "Acme Distribution",
      organizationName: "Acme Distribution",
      contactName: "Jules Smith",
      contactEmail: "jules@acme.test",
      category: "Compliance",
      description: "Automate due diligence intake.",
      amount: 82000,
      status: "changes_requested",
      history: [],
      statusTransitions: [],
      createdAt: "2026-06-28T10:00:00.000Z",
      updatedAt: "2026-07-02T08:00:00.000Z",
    },
  ],
  metadata: {
    currentPage: 1,
    perPage: 20,
    total: 2,
    lastPage: 1,
  },
}

const detailResponse = {
  data: {
    id: 42,
    title: "Northwind Mutual",
    organizationName: "Northwind Mutual",
    contactName: "Jane Doe",
    contactEmail: "jane@northwind.test",
    category: "Operations",
    description: "Expand the customer support desk.",
    amount: 125000,
    status: "draft",
    history: [
      {
        id: 1,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-01T09:00:00.000Z",
        actor: {
          id: 11,
          fullName: "Jane Doe",
          email: "jane@northwind.test",
        },
      },
    ],
    statusTransitions: [
      {
        id: 1,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-01T09:00:00.000Z",
        actor: {
          id: 11,
          fullName: "Jane Doe",
          email: "jane@northwind.test",
        },
      },
    ],
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-02T11:30:00.000Z",
  },
}

const requestedChangesResponse = {
  data: {
    id: 7,
    title: "Acme Distribution",
    organizationName: "Acme Distribution",
    contactName: "Jules Smith",
    contactEmail: "jules@acme.test",
    category: "Compliance",
    description: "Automate due diligence intake.",
    amount: 82000,
    status: "changes_requested",
    history: [
      {
        id: 3,
        previousStatus: "under_review",
        nextStatus: "changes_requested",
        comment: "Please clarify the budget assumptions.",
        createdAt: "2026-07-02T08:00:00.000Z",
        actor: {
          id: 22,
          fullName: "Riley Reviewer",
          email: "riley@example.com",
        },
      },
    ],
    statusTransitions: [
      {
        id: 3,
        previousStatus: "under_review",
        nextStatus: "changes_requested",
        comment: "Please clarify the budget assumptions.",
        createdAt: "2026-07-02T08:00:00.000Z",
        actor: {
          id: 22,
          fullName: "Riley Reviewer",
          email: "riley@example.com",
        },
      },
    ],
    createdAt: "2026-06-28T10:00:00.000Z",
    updatedAt: "2026-07-02T08:00:00.000Z",
  },
}

function renderAt(path: string) {
  return render(
    <AppProviders>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    </AppProviders>,
  )
}

function renderWithRole(path: string, currentRole: "applicant" | "reviewer") {
  return render(
    <AppProviders>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <App currentRole={currentRole} />
        </MemoryRouter>
      </ThemeProvider>
    </AppProviders>,
  )
}

let reopenedApplicationIds = new Set<number>()

beforeEach(() => {
  reopenedApplicationIds = new Set<number>()

  vi.spyOn(api, "request").mockImplementation(async (routeName, options) => {
    if (routeName === "applicant.applications.index") {
      return listResponse
    }

    if (routeName === "applicant.applications.show" && options?.params?.id === 42) {
      return detailResponse
    }

    if (routeName === "applicant.applications.show" && options?.params?.id === 99) {
      return {
        data: {
          ...detailResponse.data,
          id: 99,
          status: "draft",
        },
      }
    }

    if (routeName === "applicant.applications.show" && options?.params?.id === 7) {
      if (reopenedApplicationIds.has(7)) {
        return {
          data: {
            ...requestedChangesResponse.data,
            status: "draft",
          },
        }
      }

      return requestedChangesResponse
    }

    if (routeName === "applicant.applications.store") {
      return {
        data: {
          ...detailResponse.data,
          id: 99,
          status: "draft",
        },
      }
    }

    if (routeName === "applicant.applications.update") {
      if (options?.body?.contactEmail === "not-an-email") {
        throw {
          response: {
            json: async () => ({
              errors: [
                {
                  field: "contactEmail",
                  message: "The contact email field must be a valid email address.",
                },
              ],
            }),
          },
        }
      }

      return {
        data: {
          ...detailResponse.data,
          ...options?.body,
        },
      }
    }

    if (routeName === "applicant.applications.submissions.store") {
      return {
        data: {
          ...detailResponse.data,
          status: "submitted",
          history: [
            {
              id: 4,
              previousStatus: "draft",
              nextStatus: "submitted",
              comment: null,
              createdAt: "2026-07-03T08:00:00.000Z",
              actor: {
                id: 11,
                fullName: "Jane Doe",
                email: "jane@northwind.test",
              },
            },
          ],
        },
      }
    }

    if (routeName === "applicant.application_draft_reopenings.store") {
      reopenedApplicationIds.add(7)
      return {
        application: {
          id: 7,
          status: "draft",
          updatedAt: "2026-07-03T09:00:00.000Z",
        },
      }
    }

    throw new Error(`Unhandled request: ${String(routeName)}`)
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("App routing", () => {
  it("sends an applicant to the applicant workspace and loads their applications", async () => {
    renderWithRole("/", "applicant")

    expect(await screen.findByRole("heading", { name: "Your applications" })).toBeInTheDocument()
    expect(screen.getByText("Northwind Mutual")).toBeInTheDocument()
    expect(screen.getByText("Acme Distribution")).toBeInTheDocument()
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

  it("creates a draft, edits it with the shared form, and shows backend validation feedback", async () => {
    renderWithRole("/applicant", "applicant")

    fireEvent.click(await screen.findByRole("button", { name: "Start a new draft" }))

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Edit draft application" })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText("Contact email"), {
      target: { value: "not-an-email" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }))

    expect(
      await screen.findByText("The contact email field must be a valid email address."),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Northwind Mutual" },
    })
    fireEvent.change(screen.getByLabelText("Contact name"), {
      target: { value: "Jane Doe" },
    })
    fireEvent.change(screen.getByLabelText("Contact email"), {
      target: { value: "jane@northwind.test" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }))

    expect(await screen.findByText("Draft saved.")).toBeInTheDocument()
  })

  it("shows a detail view with workflow status and timeline, then submits the application", async () => {
    renderWithRole("/applicant/applications/42", "applicant")

    expect(await screen.findByText("Status: Draft")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Application timeline" })).toBeInTheDocument()
    expect(screen.getByText("Draft -> Submitted")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Submit application" }))

    expect(await screen.findByText("Status: Submitted")).toBeInTheDocument()
  })

  it("keeps requested-changes applications read-only until the applicant reopens the draft", async () => {
    renderWithRole("/applicant/applications/7", "applicant")

    expect(await screen.findByText("Status: Changes requested")).toBeInTheDocument()
    expect(screen.getByText("Please clarify the budget assumptions.")).toBeInTheDocument()
    expect(screen.queryByLabelText("Organization name")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Reopen draft" }))

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Edit draft application" })).toBeInTheDocument()
    })
    expect(screen.getByLabelText("Organization name")).toBeInTheDocument()
  })
})
