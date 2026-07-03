import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

export function QueuePagination({
  currentPage,
  lastPage,
  onPageChange,
  className,
}: {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  className?: string
}) {
  if (lastPage <= 1) {
    return null
  }

  return (
    <Pagination className={cn("mx-0 w-auto justify-end", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={currentPage <= 1}
            onClick={() => {
              onPageChange(currentPage - 1)
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="flex h-9 min-w-24 items-center justify-center px-3 text-sm text-muted-foreground">
            {currentPage} / {lastPage}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            disabled={currentPage >= lastPage}
            onClick={() => {
              onPageChange(currentPage + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
