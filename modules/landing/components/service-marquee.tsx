"use client"

import { useState } from "react"
import {
  Activity,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  CreditCard,
  FileBadge,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Globe,
  HeartPulse,
  IdCard,
  Pause,
  Play,
  Shield,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const marqueeServices = [
  {
    icon: IdCard,
    category: "Ministry of Labour",
    title: "2-Year Work Permit & Visa",
    desc: "Complete processing of Tor Ror 38, Non-L-A Visa, and digital permit booklet renewal.",
    badge: "Official Legalization",
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    accent: "text-blue-500 border-blue-500/20 bg-blue-500/10",
  },
  {
    icon: Globe,
    category: "Cross-Border MOU",
    title: "MOU Worker Intake & Dispatch",
    desc: "Full cycle recruiting from Myanmar, demand letters, smart cards, and embassy verification.",
    badge: "Bilateral Agreement",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    accent: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
  },
  {
    icon: Clock,
    category: "Immigration Bureau",
    title: "90-Day Online Reporting (TM.47)",
    desc: "Automated tracking and submission to immigration before expiry to eliminate fines.",
    badge: "100% On-Time Guarantee",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    accent: "text-amber-500 border-amber-500/20 bg-amber-500/10",
  },
  {
    icon: FileBadge,
    category: "Consular Services",
    title: "Passport PJ & CI Renewal",
    desc: "Certificate of Identity extensions, Myanmar Embassy endorsement, and PJ book transfers.",
    badge: "Consular Approved",
    gradient: "from-purple-500/10 via-pink-500/5 to-transparent",
    accent: "text-purple-500 border-purple-500/20 bg-purple-500/10",
  },
  {
    icon: HeartPulse,
    category: "Ministry of Public Health",
    title: "Medical Check & Blood Testing",
    desc: "Government hospital medical certificate, chest X-ray, syphilis, and 6-disease screening.",
    badge: "Certified Hospital",
    gradient: "from-rose-500/10 via-red-500/5 to-transparent",
    accent: "text-rose-500 border-rose-500/20 bg-rose-500/10",
  },
  {
    icon: Shield,
    category: "Social Security Office",
    title: "SSO Fund & Tor Ror 38/1",
    desc: "Hospital choice registration, compensation benefits, and workplace legal quota audit.",
    badge: "Labor Protection",
    gradient: "from-cyan-500/10 via-sky-500/5 to-transparent",
    accent: "text-cyan-500 border-cyan-500/20 bg-cyan-500/10",
  },
  {
    icon: Building,
    category: "Corporate Employers",
    title: "Company Quota & Compliance",
    desc: "Foreign worker ratio filings, factory inspections, tax records, and legal contracts.",
    badge: "Enterprise Ready",
    gradient: "from-indigo-500/10 via-blue-500/5 to-transparent",
    accent: "text-indigo-500 border-indigo-500/20 bg-indigo-500/10",
  },
  {
    icon: CreditCard,
    category: "Accounting & Finance",
    title: "Transparent Deposit & Payments",
    desc: "Real-time ledger tracking worker deposits, government fee slips, and balance receipts.",
    badge: "Zero Hidden Fees",
    gradient: "from-teal-500/10 via-emerald-500/5 to-transparent",
    accent: "text-teal-500 border-teal-500/20 bg-teal-500/10",
  },
]

function ServiceMarqueeCard({ item }: { item: typeof marqueeServices[0] }) {
  const Icon = item.icon
  return (
    <article className={`group relative h-48 w-80 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br ${item.gradient} bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:h-52 sm:w-96`}>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${item.accent}`}>
          <Sparkles className="size-3" />
          {item.badge}
        </span>
        <div className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 shadow-xs">
          <Icon className="size-5 text-foreground" />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {item.category}
        </p>
        <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.desc}
        </p>
      </div>

      <div className="absolute bottom-3 right-4 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span>Learn more</span>
        <span>→</span>
      </div>
    </article>
  )
}

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...marqueeServices].reverse() : marqueeServices

  return (
    <div className="service-marquee__viewport overflow-hidden">
      <div
        className={`service-marquee__track flex w-max gap-4 py-2 ${
          reverse ? "service-marquee__track--reverse" : ""
        }`}
      >
        {[0, 1].map((copyIndex) => (
          <div
            key={copyIndex}
            aria-hidden={copyIndex === 1}
            className="flex shrink-0 gap-4 pr-4"
          >
            {items.map((service, index) => (
              <ServiceMarqueeCard key={`${copyIndex}-${index}`} item={service} />
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
      id="services"
      aria-labelledby="service-marquee-title"
      className="service-marquee space-y-6 overflow-hidden border-y border-border/60 bg-muted/20 py-14 sm:py-20"
      data-paused={paused}
    >
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            <span>21st.dev Interactive Component</span>
          </div>
          <h2
            id="service-marquee-title"
            className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            End-to-End Thai Work Permit Solutions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hover over any service card to pause and inspect our government and legal procedures.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 rounded-full"
          aria-label={paused ? "Resume marquee" : "Pause marquee"}
          aria-pressed={paused}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          <span className="text-xs">{paused ? "Resume" : "Pause"}</span>
        </Button>
      </div>

      <div className="space-y-4 pt-2">
        <MarqueeRow />
        <MarqueeRow reverse />
      </div>
    </section>
  )
}
