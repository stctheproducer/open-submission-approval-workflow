import { Filter } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ReviewState } from "@/lib/review-workflow"

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Ready", value: "ready" },
  { label: "Owned", value: "owned" },
] as const

export function ReviewStateFilter({
  value,
  onValueChange,
}: {
  value: ReviewState | null
  onValueChange: (value: ReviewState | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
      <ToggleGroup
        aria-label="Review state filter"
        className="flex-wrap"
        spacing={0}
        value={[value ?? "all"]}
        onValueChange={(nextValue) => {
          const nextSelection = nextValue[0]
          onValueChange(
            nextSelection === "all" || !nextSelection ? null : nextSelection
          )
        }}
      >
        {filterOptions.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            variant="outline"
            size="sm"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
