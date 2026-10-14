import { landingCopy } from "@/modules/landing/constants"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {landingCopy.steps.title}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {landingCopy.steps.items.map((step, index) => (
            <div key={step} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <p className="text-base leading-7 text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
