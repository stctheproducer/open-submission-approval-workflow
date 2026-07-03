import type { ReactNode } from "react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function WorkspaceErrorState({
  title,
  description,
  actionLabel,
  secondaryActionLabel,
  onAction,
  secondaryActionTo = "/login",
  eyebrow = "Session expired",
}: {
  eyebrow?: string
  title: string
  description: ReactNode
  actionLabel: string
  secondaryActionLabel: string
  onAction?: () => void
  secondaryActionTo?: string
}) {
  return (
    <Card className="rounded-[2rem] border border-border bg-background/70 shadow-sm">
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link to={secondaryActionTo} />}
          >
            {secondaryActionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
