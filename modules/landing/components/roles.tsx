import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { landingCopy } from "@/modules/landing/constants"

export function RolesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Roles</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {landingCopy.roles.title}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {landingCopy.roles.items.map((role) => (
          <Card key={role.title} className="h-full border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>{role.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-muted-foreground">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
