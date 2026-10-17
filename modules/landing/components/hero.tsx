import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { landingCopy } from "@/modules/landing/constants"

const previewIcons = [UsersRound, FileText, CalendarDays]

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_15%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-12 lg:py-24">
        <div>
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary shadow-sm sm:text-sm">
            <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{landingCopy.hero.eyebrow}</span>
          </div>

          <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
            {landingCopy.hero.headlineBefore}{" "}
            <span className="bg-linear-to-r from-primary via-emerald-500 to-sky-600 bg-clip-text text-transparent">
              {landingCopy.hero.headlineHighlight}
            </span>{" "}
            {landingCopy.hero.headlineAfter}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {landingCopy.hero.subheading}
          </p>

          <ul className="mt-8 grid max-w-2xl gap-x-6 gap-y-4 sm:grid-cols-2">
            {landingCopy.hero.capabilities.map((label) => (
              <li key={label} className="flex items-start gap-2.5 text-sm font-medium leading-6">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/login">
              <Button size="lg" className="h-12 gap-2 px-6 shadow-md shadow-primary/15">
                {landingCopy.hero.primaryCta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="#about">
              <Button variant="outline" size="lg" className="h-12 gap-2 px-6">
                {landingCopy.hero.secondaryCta}
                <ArrowDown className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            className="absolute -inset-5 -z-10 rounded-[2rem] bg-linear-to-br from-primary/15 via-emerald-500/10 to-sky-500/15 blur-2xl"
            aria-hidden="true"
          />
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-2xl shadow-foreground/10 backdrop-blur sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold tracking-tight">{landingCopy.hero.previewTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{landingCopy.hero.previewSubtitle}</p>
                </div>
              </div>
              <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                Workspace preview
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-border/80 bg-background p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Your team&apos;s workspace</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    Worker operations
                  </h2>
                </div>
                <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <UsersRound className="size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {landingCopy.hero.previewItems.map((item, index) => {
                  const Icon = previewIcons[index]
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{landingCopy.hero.previewNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
