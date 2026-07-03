import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { DocumentMeta, PageMetaProvider } from "@/routing/page-meta"

function renderMetaAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PageMetaProvider>
        <DocumentMeta />
      </PageMetaProvider>
    </MemoryRouter>,
  )
}

describe("DocumentMeta", () => {
  it("sets the login page title and description", () => {
    renderMetaAt("/login")

    expect(document.title).toBe("Sign in | Submission & Approval Workflow")
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute("content"),
    ).toContain("Sign in as an applicant or reviewer")
  })

  it("sets the reviewer queue title", () => {
    renderMetaAt("/reviewer")

    expect(document.title).toBe("Review queue | Submission & Approval Workflow")
  })
})
