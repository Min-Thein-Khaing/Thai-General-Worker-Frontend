import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

type LoginPageBackgroundProps = {
  children: ReactNode
  imageSrc?: string
  className?: string
}

export function LoginPageBackground({
  children,
  imageSrc,
  className,
}: LoginPageBackgroundProps) {
  const backgroundStyle: CSSProperties | undefined = imageSrc
    ? { backgroundImage: `url("${imageSrc}")` }
    : undefined

  return (
    <div
      className={cn(
        "relative isolate min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center",
        className,
      )}
      style={backgroundStyle}
    >
      <div
        className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-950/35 via-slate-950/25 to-slate-950/45"
        aria-hidden="true"
      />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  )
}
