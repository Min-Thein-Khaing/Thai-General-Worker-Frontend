import Link from "next/link"

import { Button } from "@/components/ui/button"
import { landingCopy } from "@/modules/landing/constants"

export function ContactFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{landingCopy.contact.title}</h2>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p>{landingCopy.contact.email}</p>
              <p>{landingCopy.contact.phone}</p>
              <p>{landingCopy.contact.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          {landingCopy.contact.footer}
        </div>
      </div>
    </footer>
  )
}
