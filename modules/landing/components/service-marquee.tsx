"use client"

import Image from "next/image"
import { useState } from "react"
import { Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { landingCopy } from "@/modules/landing/constants"

const services = landingCopy.features.items

function ServiceCard({ index }: { index: number }) {
  const service = services[index % services.length]

  return (
    <article className="relative h-64 w-56 shrink-0 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm sm:h-72 sm:w-64">
      <Image
        src={service.image}
        alt={service.imageAlt}
        fill
        sizes="(max-width: 640px) 224px, 256px"
        className="object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
          {landingCopy.serviceMarquee.label}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">{service.title}</h3>
      </div>
    </article>
  )
}

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const indexes = reverse
    ? [...services.keys()].reverse()
    : [...services.keys()]

  return (
    <div className="service-marquee__viewport overflow-hidden">
      <div
        className={`service-marquee__track flex w-max py-2 ${reverse ? "service-marquee__track--reverse" : ""}`}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 gap-4 pr-4"
          >
            {indexes.map((index) => (
              <ServiceCard key={`${copy}-${index}`} index={index} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ServiceMarquee() {
  const [paused, setPaused] = useState(false)

  return (
    <section
      aria-labelledby="service-marquee-title"
      className="service-marquee space-y-7 overflow-hidden py-12 sm:py-16"
      data-paused={paused}
    >
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            One clear workspace
          </p>
          <h2
            id="service-marquee-title"
            className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl"
          >
            The day-to-day details, all moving together.
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label={paused ? landingCopy.serviceMarquee.resumeLabel : landingCopy.serviceMarquee.pauseLabel}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </Button>
      </div>

      <div className="space-y-4">
        <MarqueeRow />
        <MarqueeRow reverse />
      </div>
      <p className="sr-only" aria-live="polite">
        {paused
          ? landingCopy.serviceMarquee.pausedAnnouncement
          : landingCopy.serviceMarquee.movingAnnouncement}
      </p>
    </section>
  )
}
