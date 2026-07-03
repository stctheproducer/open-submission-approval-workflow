import type { ReactNode } from "react"
import { AlertCircle, CircleCheckBig } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ErrorAlert({
  title = "Action unavailable",
  children,
  action,
}: {
  title?: string
  children: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <Alert
      variant="destructive"
      className="rounded-[1.5rem] border-destructive/20 bg-destructive/10"
    >
      <AlertCircle aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{children}</span>
        {action ? (
          <Button size="sm" variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

export function SuccessAlert({
  title = "Updated",
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <Alert className="rounded-[1.5rem] border border-primary/20 bg-primary/8 text-foreground after:bg-primary">
      <CircleCheckBig aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-foreground/80">
        {children}
      </AlertDescription>
    </Alert>
  )
}
