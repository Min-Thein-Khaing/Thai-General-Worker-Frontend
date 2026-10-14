import Link from "next/link"
import { ArrowRight, BadgeCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { landingCopy } from "@/modules/landing/constants"

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-sm font-medium text-primary">
            <BadgeCheck className="size-4" />
            {landingCopy.hero.eyebrow}
          </div>

          <div className="space-y-5">
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {landingCopy.hero.headline}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{landingCopy.hero.subheading}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg">
                {landingCopy.hero.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="#about">
              <Button variant="outline" size="lg">
                {landingCopy.hero.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-xl shadow-primary/5">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Operational status</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Workers</p>
                  <p className="mt-2 text-2xl font-semibold">Live</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Renewals</p>
                  <p className="mt-2 text-2xl font-semibold">Tracked</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Passport & visa dates</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">On track</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Home office reports</span>
                <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">Due soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Payment balance</span>
                <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600">Visible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
