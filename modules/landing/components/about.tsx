import { landingCopy } from "@/modules/landing/constants"

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">About</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {landingCopy.about.title}
            </h2>
          </div>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>{landingCopy.about.body}</p>
            <p>{landingCopy.about.audience}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
