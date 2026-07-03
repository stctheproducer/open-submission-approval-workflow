export const SITE_NAME = "Submission & Approval Workflow"

export const DEFAULT_SITE_DESCRIPTION =
  "Submit applications, track review outcomes, and move records through an approval workflow with applicants and reviewers."

export type PageMeta = {
  title: string
  description: string
  robots?: string
}

export const DEFAULT_PAGE_META: PageMeta = {
  title: SITE_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
}

export function formatDocumentTitle(title: string) {
  if (title === SITE_NAME) {
    return title
  }

  return `${title} | ${SITE_NAME}`
}
