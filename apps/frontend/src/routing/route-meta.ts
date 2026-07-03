import { matchRoutes, type RouteObject } from "react-router"

import {
  DEFAULT_PAGE_META,
  DEFAULT_SITE_DESCRIPTION,
  SITE_NAME,
  type PageMeta,
} from "@/routing/site-meta"

export type RouteMetaHandle = {
  pageMeta: PageMeta
}

function meta(pageMeta: PageMeta): RouteMetaHandle {
  return { pageMeta }
}

/**
 * Path-only route tree used with `matchRoutes` for document metadata.
 * Keep paths aligned with `App.tsx` route definitions.
 */
export const routeMetaTree: RouteObject[] = [
  {
    path: "/",
    handle: meta({
      title: SITE_NAME,
      description: DEFAULT_SITE_DESCRIPTION,
      robots: "noindex, nofollow",
    }),
  },
  {
    path: "/login",
    handle: meta({
      title: "Sign in",
      description:
        "Sign in as an applicant or reviewer to access the submission and approval workflow.",
      robots: "noindex, nofollow",
    }),
  },
  {
    path: "/applicant",
    handle: meta({
      title: "My applications",
      description:
        "Create draft applications, submit them for review, and track outcomes from the applicant workspace.",
      robots: "noindex, nofollow",
    }),
  },
  {
    path: "/applicant/applications/new",
    handle: meta({
      title: "New application",
      description: "Start a new draft application and prepare it for submission.",
      robots: "noindex, nofollow",
    }),
  },
  {
    path: "/applicant/applications/:id/edit",
    handle: meta({
      title: "Edit application",
      description: "Update a draft application before submission.",
      robots: "noindex, nofollow",
    }),
  },
  {
    path: "/applicant/applications/:id",
    handle: meta({
      title: "Application detail",
      description: "Review application details, history, and attachments.",
      robots: "noindex, nofollow",
    }),
  },
  {
    path: "/reviewer",
    handle: meta({
      title: "Review queue",
      description:
        "Browse submitted applications, start reviews, and record approval decisions.",
      robots: "noindex, nofollow",
    }),
  },
  {
    path: "/reviewer/applications/:id",
    handle: meta({
      title: "Review application",
      description: "Review application details and record an approval workflow decision.",
      robots: "noindex, nofollow",
    }),
  },
]

export function pageMetaForPathname(pathname: string): PageMeta {
  const matches = matchRoutes(routeMetaTree, pathname)
  if (!matches?.length) {
    return DEFAULT_PAGE_META
  }

  const handle = matches[matches.length - 1].route.handle as RouteMetaHandle | undefined
  return handle?.pageMeta ?? DEFAULT_PAGE_META
}
