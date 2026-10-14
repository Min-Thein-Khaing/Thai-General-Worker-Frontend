import { ArrowUpRight, FileText, Landmark, ShieldCheck, TicketCheck, UsersRound } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { landingCopy } from "@/modules/landing/constants"

const icons = [UsersRound, TicketCheck, ArrowUpRight, Landmark, FileText, ShieldCheck]

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Features</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {landingCopy.features.title}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {landingCopy.features.items.map((feature, index) => {
          const Icon = icons[index] ?? ShieldCheck

          return (
            <Card key={feature.title} className="h-full border-border/70 bg-card/90">
              <CardHeader>
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
