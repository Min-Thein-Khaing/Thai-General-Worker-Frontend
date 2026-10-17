import type { ReactNode } from "react"

import { LoginPageBackground } from "@/modules/auth/components/login-page-background"
import { PublicNavbar } from "@/modules/landing/components/public-navbar"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <LoginPageBackground imageSrc="/mesh_mountain_bg.jpg">
      <PublicNavbar className="border-white/10 bg-slate-950/35" />
      {children}
    </LoginPageBackground>
  )
}
