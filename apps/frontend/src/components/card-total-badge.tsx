export function CardTotalBadge({
  total,
  label,
}: {
  total: number
  label: string
}) {
  return (
    <span
      aria-label={label}
      className="absolute top-6 right-6 flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-normal text-primary-foreground normal-case"
    >
      {total}
    </span>
  )
}
