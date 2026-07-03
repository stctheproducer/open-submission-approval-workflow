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

let applicantDetailResponse = clone(detailResponse)
let applicantRequestedChangesResponse = clone(requestedChangesResponse)

type ReviewerUser = {
  id: number
  fullName: string
  email: string
}

type ReviewerApplication = {
  id: number
  title: string
  organizationName: string
  contactName: string
  contactEmail: string
  category: string
  description: string
  amount: number
  status: "submitted" | "under_review" | "approved"
  reviewState: "ready" | "owned"
  applicant: ReviewerUser
  assignedReviewer: ReviewerUser | null
  reviewer: ReviewerUser | null
  history: Array<{
    id: number
    previousStatus: string | null
    nextStatus: string
    comment: string | null
    createdAt: string
    actor: ReviewerUser
  }>
  statusTransitions: Array<{
    id: number
    previousStatus: string | null
    nextStatus: string
    comment: string | null
    createdAt: string
    actor: ReviewerUser
  }>
  createdAt: string
  updatedAt: string
}

const reviewerUser: ReviewerUser = {
  id: 70,
  fullName: "Riley Reviewer",
  email: "riley@example.com",
}

const reviewerApplicantOne: ReviewerUser = {
  id: 71,
  fullName: "Avery Applicant",
  email: "avery@example.com",
}

const reviewerApplicantTwo: ReviewerUser = {
  id: 72,
  fullName: "Casey Applicant",
  email: "casey@example.com",
}

const reviewerSeedApplications: ReviewerApplication[] = [
  {
    id: 201,
    title: "Harbor Lending",
    organizationName: "Harbor Lending",
    contactName: "Avery Applicant",
    contactEmail: "avery@example.com",
    category: "Operations",
    description: "Expand underwriting capacity.",
    amount: 180000,
    status: "submitted",
    reviewState: "ready",
    applicant: reviewerApplicantOne,
    assignedReviewer: null,
    reviewer: null,
    history: [
      {
        id: 2011,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-02T08:00:00.000Z",
        actor: reviewerApplicantOne,
      },
    ],
    statusTransitions: [
      {
        id: 2011,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-02T08:00:00.000Z",
        actor: reviewerApplicantOne,
      },
    ],
    createdAt: "2026-07-02T08:00:00.000Z",
    updatedAt: "2026-07-02T08:00:00.000Z",
  },
  {
    id: 202,
    title: "Summit Insurance",
    organizationName: "Summit Insurance",
    contactName: "Riley Reviewer",
    contactEmail: "riley@example.com",
    category: "Compliance",
    description: "Review policy exception handling.",
    amount: 95000,
    status: "under_review",
    reviewState: "owned",
    applicant: reviewerApplicantTwo,
    assignedReviewer: reviewerUser,
    reviewer: reviewerUser,
    history: [
      {
        id: 2021,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-01T12:00:00.000Z",
        actor: reviewerApplicantTwo,
      },
      {
        id: 2022,
        previousStatus: "submitted",
        nextStatus: "under_review",
        comment: null,
        createdAt: "2026-07-02T09:30:00.000Z",
        actor: reviewerUser,
      },
    ],
    statusTransitions: [
      {
        id: 2021,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-01T12:00:00.000Z",
        actor: reviewerApplicantTwo,
      },
      {
        id: 2022,
        previousStatus: "submitted",
        nextStatus: "under_review",
        comment: null,
        createdAt: "2026-07-02T09:30:00.000Z",
        actor: reviewerUser,
      },
    ],
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-07-02T09:30:00.000Z",
  },
  {
    id: 203,
    title: "Blue Harbor Capital",
    organizationName: "Blue Harbor Capital",
    contactName: "Morgan Applicant",
    contactEmail: "morgan@example.com",
    category: "Risk",
    description: "Streamline portfolio review.",
    amount: 420000,
    status: "submitted",
    reviewState: "ready",
    applicant: {
      id: 73,
      fullName: "Morgan Applicant",
      email: "morgan@example.com",
    },
    assignedReviewer: null,
    reviewer: null,
    history: [
      {
        id: 2031,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-03T09:00:00.000Z",
        actor: {
          id: 73,
          fullName: "Morgan Applicant",
          email: "morgan@example.com",
        },
      },
    ],
    statusTransitions: [
      {
        id: 2031,
        previousStatus: "draft",
        nextStatus: "submitted",
        comment: null,
        createdAt: "2026-07-03T09:00:00.000Z",
        actor: {
          id: 73,
          fullName: "Morgan Applicant",
          email: "morgan@example.com",
        },
      },
    ],
    createdAt: "2026-07-03T09:00:00.000Z",
    updatedAt: "2026-07-03T09:00:00.000Z",
  },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function makeReviewerApplicationResponse(application: ReviewerApplication) {
  return {
    data: clone(application),
  }
}

function buildReviewerQueueResponse(applications: ReviewerApplication[], reviewState?: string) {
  const filtered = applications.filter((application) => {
    if (reviewState === "ready") {
      return application.status === "submitted" && application.reviewState === "ready"
    }

    if (reviewState === "owned") {
      return application.status === "under_review" && application.reviewState === "owned"
    }

    return (
      (application.status === "submitted" && application.reviewState === "ready") ||
      (application.status === "under_review" && application.reviewState === "owned")
    )
  })

  const ordered = [...filtered].sort((left, right) => {
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  })

  return {
    data: ordered.map((application) => clone(application)),
    metadata: {
      currentPage: 1,
      perPage: 20,
      total: ordered.length,
      lastPage: 1,
    },
  }
}

let reviewerApplications = new Map<number, ReviewerApplication>()
let reviewerTransitionId = 4000

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

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve, reject }
}

let reopenedApplicationIds = new Set<number>()

beforeEach(() => {
  window.localStorage.clear()
  reopenedApplicationIds = new Set<number>()
  applicantDetailResponse = clone(detailResponse)
  applicantRequestedChangesResponse = clone(requestedChangesResponse)
  reviewerApplications = new Map(reviewerSeedApplications.map((application) => [application.id, clone(application)]))
  reviewerTransitionId = 4000

  vi.spyOn(api, "request").mockImplementation(async (routeName, options) => {
    if (routeName === "auth.sessions.store") {
      const email = String(options?.body?.email ?? "")
      const role = email === "riley@example.com" ? "reviewer" : "applicant"

      return {
        user: {
          id: role === "reviewer" ? 70 : 11,
          fullName: role === "reviewer" ? "Riley Reviewer" : "Jane Doe",
          email,
          role,
          initials: role === "reviewer" ? "RR" : "JD",
          createdAt: "2026-07-03T09:00:00.000Z",
          updatedAt: "2026-07-03T09:00:00.000Z",
        },
      }
    }

    if (routeName === "applicant.applications.index") {
      return listResponse
    }

    if (routeName === "applicant.applications.show" && options?.params?.id === 42) {
      return applicantDetailResponse
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
        return applicantRequestedChangesResponse
      }

      return applicantRequestedChangesResponse
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
      applicantDetailResponse = {
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
      return applicantDetailResponse
    }

    if (routeName === "applicant.application_draft_reopenings.store") {
      reopenedApplicationIds.add(7)
      applicantRequestedChangesResponse = {
        data: {
          ...requestedChangesResponse.data,
          status: "draft",
          updatedAt: "2026-07-03T09:00:00.000Z",
        },
      }
      return {
        application: {
          id: 7,
          status: "draft",
          updatedAt: "2026-07-03T09:00:00.000Z",
        },
      }
    }

    if (routeName === "reviewer.applications.index") {
      return buildReviewerQueueResponse(
        [...reviewerApplications.values()],
        options?.query?.reviewState,
      )
    }

    if (routeName === "reviewer.applications.show") {
      const application = reviewerApplications.get(Number(options?.params?.id))
      if (!application) {
        throw new Error(`Unhandled reviewer detail application: ${String(options?.params?.id)}`)
      }

      return makeReviewerApplicationResponse(application)
    }

    if (routeName === "reviewer.application_review_starts.store") {
      const applicationId = Number(options?.params?.id)
      const application = reviewerApplications.get(applicationId)

      if (!application) {
        throw new Error(`Unhandled reviewer review-start application: ${applicationId}`)
      }

      const startedAt = "2026-07-03T10:00:00.000Z"
      const startedApplication: ReviewerApplication = {
        ...application,
        status: "under_review",
        reviewState: "owned",
        assignedReviewer: reviewerUser,
        reviewer: reviewerUser,
        history: [
          ...application.history,
          {
            id: reviewerTransitionId++,
            previousStatus: "submitted",
            nextStatus: "under_review",
            comment: null,
            createdAt: startedAt,
            actor: reviewerUser,
          },
        ],
        statusTransitions: [
          ...application.statusTransitions,
          {
            id: reviewerTransitionId++,
            previousStatus: "submitted",
            nextStatus: "under_review",
            comment: null,
            createdAt: startedAt,
            actor: reviewerUser,
          },
        ],
        updatedAt: startedAt,
      }
      reviewerApplications.set(applicationId, startedApplication)
      return makeReviewerApplicationResponse(startedApplication)
    }

    if (routeName === "reviewer.application_approvals.store") {
      const applicationId = Number(options?.params?.applicationId)
      const application = reviewerApplications.get(applicationId)

      if (!application) {
        throw new Error(`Unhandled reviewer approval application: ${applicationId}`)
      }

      const approvedAt = "2026-07-03T10:30:00.000Z"
      const approvedApplication: ReviewerApplication = {
        ...application,
        status: "approved",
        reviewState: "owned",
        assignedReviewer: reviewerUser,
        reviewer: reviewerUser,
        history: [
          ...application.history,
          {
            id: reviewerTransitionId++,
            previousStatus: "under_review",
            nextStatus: "approved",
            comment: null,
            createdAt: approvedAt,
            actor: reviewerUser,
          },
        ],
        statusTransitions: [
          ...application.statusTransitions,
          {
            id: reviewerTransitionId++,
            previousStatus: "under_review",
            nextStatus: "approved",
            comment: null,
            createdAt: approvedAt,
            actor: reviewerUser,
          },
        ],
        updatedAt: approvedAt,
      }
      reviewerApplications.set(applicationId, approvedApplication)
      return makeReviewerApplicationResponse(approvedApplication)
    }

    if (routeName === "reviewer.application_change_requests.store") {
      const applicationId = Number(options?.params?.id)
      const application = reviewerApplications.get(applicationId)

      if (!application) {
        throw new Error(`Unhandled reviewer change-request application: ${applicationId}`)
      }

      const changedAt = "2026-07-03T10:40:00.000Z"
      const comment = String(options?.body?.comment ?? "")
      const changedApplication: ReviewerApplication = {
        ...application,
        status: "changes_requested",
        reviewState: "owned",
        assignedReviewer: reviewerUser,
        reviewer: reviewerUser,
        history: [
          ...application.history,
          {
            id: reviewerTransitionId++,
            previousStatus: "under_review",
            nextStatus: "changes_requested",
            comment,
            createdAt: changedAt,
            actor: reviewerUser,
          },
        ],
        statusTransitions: [
          ...application.statusTransitions,
          {
            id: reviewerTransitionId++,
            previousStatus: "under_review",
            nextStatus: "changes_requested",
            comment,
            createdAt: changedAt,
            actor: reviewerUser,
          },
        ],
        updatedAt: changedAt,
      }
      reviewerApplications.set(applicationId, changedApplication)
      return {
        application: {
          id: applicationId,
          status: "changes_requested",
          updatedAt: changedAt,
        },
      }
    }

    if (routeName === "reviewer.application_rejections.store") {
      const applicationId = Number(options?.params?.application_id)
      const application = reviewerApplications.get(applicationId)

      if (!application) {
        throw new Error(`Unhandled reviewer rejection application: ${applicationId}`)
      }

      const rejectedAt = "2026-07-03T10:50:00.000Z"
      const comment = String(options?.body?.comment ?? "")
      const rejectedApplication: ReviewerApplication = {
        ...application,
        status: "rejected",
        reviewState: "owned",
        assignedReviewer: reviewerUser,
        reviewer: reviewerUser,
        history: [
          ...application.history,
          {
            id: reviewerTransitionId++,
            previousStatus: "under_review",
            nextStatus: "rejected",
            comment,
            createdAt: rejectedAt,
            actor: reviewerUser,
          },
        ],
        statusTransitions: [
          ...application.statusTransitions,
          {
            id: reviewerTransitionId++,
            previousStatus: "under_review",
            nextStatus: "rejected",
            comment,
            createdAt: rejectedAt,
            actor: reviewerUser,
          },
        ],
        updatedAt: rejectedAt,
      }
      reviewerApplications.set(applicationId, rejectedApplication)
      return makeReviewerApplicationResponse(rejectedApplication)
    }

    throw new Error(`Unhandled request: ${String(routeName)}`)
  })
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
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
  })

  it("shows a form error when sign in is attempted without credentials", () => {
    renderAt("/")

    fireEvent.click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByText("Enter your email and password to continue.")).toBeInTheDocument()
    expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
      "Enter your email and password to continue.",
    )
  })

  it.each([
    {
      role: "applicant" as const,
      email: "jane@northwind.test",
      password: "secret1234",
      heading: "Your applications",
    },
    {
      role: "reviewer" as const,
      email: "riley@example.com",
      password: "secret1234",
      heading: "Review queue",
    },
  ])("routes a signed-in $role to the right workspace", async ({ email, password, heading }) => {
    renderAt("/login")

    fireEvent.change(screen.getByLabelText("Work email"), {
      target: { value: email },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: password },
    })
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))

    expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument()
  })

  it("keeps an applicant out of the reviewer area", async () => {
    renderWithRole("/reviewer", "applicant")

    expect(await screen.findByRole("heading", { name: "Your applications" })).toBeInTheDocument()
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

describe("Reviewer workspace", () => {
  it("sends a reviewer to the reviewer workspace and loads the queue", async () => {
    renderWithRole("/", "reviewer")

    expect(await screen.findByRole("heading", { name: "Review queue" })).toBeInTheDocument()
    expect(screen.getByText("Harbor Lending")).toBeInTheDocument()
    expect(screen.getByText("Summit Insurance")).toBeInTheDocument()
    expect(screen.getByText("Blue Harbor Capital")).toBeInTheDocument()
  })

  it("shows queue loading before the reviewer applications arrive", async () => {
    const deferred = createDeferred<ReturnType<typeof buildReviewerQueueResponse>>()
    vi.mocked(api.request).mockImplementationOnce((routeName: string) => {
      if (routeName === "reviewer.applications.index") {
        return deferred.promise
      }

      throw new Error(`Unexpected route during loading test: ${String(routeName)}`)
    })

    renderWithRole("/", "reviewer")

    expect(await screen.findByText("Loading review queue…")).toBeInTheDocument()

    deferred.resolve(buildReviewerQueueResponse([...reviewerApplications.values()]))

    expect(await screen.findByRole("heading", { name: "Review queue" })).toBeInTheDocument()
  })

  it("shows reviewer application detail with the embedded history", async () => {
    renderWithRole("/reviewer/applications/202", "reviewer")

    expect(await screen.findByRole("heading", { name: "Summit Insurance", level: 2 })).toBeInTheDocument()
    expect(screen.getByText("Draft -> Submitted")).toBeInTheDocument()
    expect(screen.getByText("Submitted -> Under review")).toBeInTheDocument()
    expect(screen.getByText("Assigned reviewer")).toBeInTheDocument()
    expect(screen.getAllByText("Riley Reviewer").length).toBeGreaterThan(0)
    expect(screen.getByText("Approval available")).toBeInTheDocument()
  })

  it("starts review from the detail view and reveals approval for the owned application", async () => {
    renderWithRole("/reviewer/applications/201", "reviewer")

    expect(await screen.findByRole("heading", { name: "Harbor Lending", level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Approve application" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Start review" }))

    expect(await screen.findByRole("button", { name: "Approve application" })).toBeInTheDocument()
    expect(screen.getByText("Approval available")).toBeInTheDocument()
  })

  it("shows the approval action only when the reviewer owns an under-review application", async () => {
    renderWithRole("/reviewer/applications/202", "reviewer")

    expect(await screen.findByRole("button", { name: "Approve application" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Approve application" }))

    expect(await screen.findByText("Approved")).toBeInTheDocument()
  })

  it("requires a comment before requesting changes and returns the reviewer to the queue after success", async () => {
    renderWithRole("/reviewer/applications/202", "reviewer")

    expect(await screen.findByRole("heading", { name: "Summit Insurance", level: 2 })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Request changes" })).toBeDisabled()

    fireEvent.change(screen.getByLabelText("Decision comment"), {
      target: { value: "Please clarify the budget assumptions." },
    })
    fireEvent.click(screen.getByRole("button", { name: "Request changes" }))

    expect(await screen.findByRole("heading", { name: "Review queue" })).toBeInTheDocument()
    expect(screen.queryByText("Summit Insurance")).not.toBeInTheDocument()
  })

  it("requires a comment before rejection and returns the reviewer to the queue after success", async () => {
    renderWithRole("/reviewer/applications/202", "reviewer")

    expect(await screen.findByRole("heading", { name: "Summit Insurance", level: 2 })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reject application" })).toBeDisabled()

    fireEvent.change(screen.getByLabelText("Decision comment"), {
      target: { value: "Does not meet requirements." },
    })
    fireEvent.click(screen.getByRole("button", { name: "Reject application" }))

    expect(await screen.findByRole("heading", { name: "Review queue" })).toBeInTheDocument()
    expect(screen.queryByText("Summit Insurance")).not.toBeInTheDocument()
  })

  it("filters the queue by reviewer state and can clear the filter", async () => {
    renderWithRole("/reviewer", "reviewer")

    expect(await screen.findByRole("heading", { name: "Review queue" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Owned" }))

    expect(await screen.findByText("Summit Insurance")).toBeInTheDocument()
    expect(screen.queryByText("Harbor Lending")).not.toBeInTheDocument()
    expect(screen.queryByText("Blue Harbor Capital")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "All" }))

    expect(await screen.findByText("Harbor Lending")).toBeInTheDocument()
    expect(screen.getByText("Blue Harbor Capital")).toBeInTheDocument()
  })
})
