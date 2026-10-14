"use client"

import Link from "next/link"
import { Menu, ShieldCheck } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { landingCopy } from "@/modules/landing/constants"

export function PublicNavbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3 font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <span>{landingCopy.brand}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {landingCopy.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            <Button variant="outline">{isAuthenticated ? "Go to Dashboard" : "Login"}</Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-border p-2 md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu className="size-5" />
        </button>
      </nav>

      {menuOpen ? (
        <div className="border-t border-border bg-card md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
            {landingCopy.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href={isAuthenticated ? "/dashboard" : "/login"} onClick={() => setMenuOpen(false)}>
              <Button className="w-full">{isAuthenticated ? "Go to Dashboard" : "Login"}</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
