import * as React from "react"
import type { FieldError } from "react-hook-form"

import { cn } from "@/lib/utils"

function Field({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function FieldError({
  errors,
  className,
  id,
}: {
  errors: (FieldError | undefined)[]
  className?: string
  id?: string
}) {
  const message = errors.find((error) => error?.message)?.message

  if (!message) return null

  return (
    <p
      id={id}
      data-slot="field-error"
      role="alert"
      className={cn("text-sm font-medium text-destructive", className)}
    >
      {String(message)}
    </p>
  )
}

export { Field, FieldError, FieldLabel }
