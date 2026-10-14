import type { ReactNode } from "react"

import { ContactFooter } from "@/modules/landing/components/contact-footer"
import { PublicNavbar } from "@/modules/landing/components/public-navbar"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-theme min-h-screen bg-white text-neutral-950">
      <PublicNavbar />
      {children}
      <ContactFooter />
    </div>
  )
}
