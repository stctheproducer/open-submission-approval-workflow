import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const QUEUE_PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const

export function QueuePaginationControls({
  currentPage,
  lastPage,
  perPage,
  onPageChange,
  onPerPageChange,
  className,
}: {
  currentPage: number
  lastPage: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex items-center gap-2">
        <Select
          value={String(perPage)}
          onValueChange={(value) => {
            onPerPageChange(Number(value))
          }}
        >
          <SelectTrigger className="min-w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUEUE_PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Results per page
        </span>
      </div>

      {lastPage > 1 ? (
        <Pagination className="mx-0 w-auto justify-end">
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
      ) : (
        <div className="flex h-9 items-center px-3 text-sm text-muted-foreground">
          Page 1 of 1
        </div>
      )}
    </div>
  )
}
