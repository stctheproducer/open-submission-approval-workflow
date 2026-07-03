import type { ComponentProps } from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-wrap items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn(className)}
      {...props}
    />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ComponentProps<typeof Button>, "size"> &
  ComponentProps<typeof Button>

function PaginationLink({
  className,
  isActive,
  size = "icon-sm",
  variant = "ghost",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      variant={isActive ? "outline" : variant}
      size={size}
      className={cn(className)}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: ComponentProps<typeof Button> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="sm"
      className={cn("pl-2!", className)}
      {...props}
    >
      <ChevronLeft data-icon="inline-start" aria-hidden="true" />
      {text}
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: ComponentProps<typeof Button> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="sm"
      className={cn("pr-2!", className)}
      {...props}
    >
      {text}
      <ChevronRight data-icon="inline-end" aria-hidden="true" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
