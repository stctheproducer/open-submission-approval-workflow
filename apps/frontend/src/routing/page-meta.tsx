import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useLocation } from "react-router"

import { pageMetaForPathname } from "@/routing/route-meta"
import {
  DEFAULT_PAGE_META,
  formatDocumentTitle,
  type PageMeta,
} from "@/routing/site-meta"

type PageMetaOverrideContextValue = {
  override: PageMeta | null
  setOverride: (meta: PageMeta | null) => void
}

const PageMetaOverrideContext =
  createContext<PageMetaOverrideContextValue | null>(null)

function upsertMetaTag(
  attribute: "name" | "property",
  key: string,
  content: string
) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute("content", content)
}

function removeMetaTag(attribute: "name" | "property", key: string) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove()
}

function applyPageMeta(meta: PageMeta, pathname: string) {
  const title = formatDocumentTitle(meta.title)
  const canonicalUrl = `${window.location.origin}${pathname}`

  document.title = title
  upsertMetaTag("name", "description", meta.description)
  upsertMetaTag("property", "og:title", title)
  upsertMetaTag("property", "og:description", meta.description)
  upsertMetaTag("property", "og:type", "website")
  upsertMetaTag("property", "og:url", canonicalUrl)
  upsertMetaTag("name", "twitter:card", "summary")
  upsertMetaTag("name", "twitter:title", title)
  upsertMetaTag("name", "twitter:description", meta.description)

  if (meta.robots) {
    upsertMetaTag("name", "robots", meta.robots)
  } else {
    removeMetaTag("name", "robots")
  }
}

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<PageMeta | null>(null)

  const value = useMemo(
    () => ({
      override,
      setOverride,
    }),
    [override]
  )

  return (
    <PageMetaOverrideContext.Provider value={value}>
      {children}
    </PageMetaOverrideContext.Provider>
  )
}

export function DocumentMeta() {
  const location = useLocation()
  const context = useContext(PageMetaOverrideContext)

  const meta = context?.override ?? pageMetaForPathname(location.pathname)

  useEffect(() => {
    applyPageMeta(meta ?? DEFAULT_PAGE_META, location.pathname)
  }, [location.pathname, meta])

  return null
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSetPageMeta(meta: PageMeta | null) {
  const context = useContext(PageMetaOverrideContext)

  if (!context) {
    throw new Error("useSetPageMeta must be used within PageMetaProvider")
  }

  const { setOverride } = context

  useEffect(() => {
    setOverride(meta)
    return () => setOverride(null)
  }, [meta, setOverride])
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApplicationPageMeta(
  application: { title: string } | null | undefined,
  contextLabel: string
) {
  const meta = application?.title
    ? ({
        title: application.title,
        description: `${contextLabel} for ${application.title} in the submission and approval workflow.`,
        robots: "noindex, nofollow",
      } satisfies PageMeta)
    : null

  useSetPageMeta(meta)
}
