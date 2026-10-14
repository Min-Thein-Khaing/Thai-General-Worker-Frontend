import type { ReactNode } from "react"

import { PublicNavbar } from "@/modules/landing/components/public-navbar"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />
      {children}
    </div>
  )
}
