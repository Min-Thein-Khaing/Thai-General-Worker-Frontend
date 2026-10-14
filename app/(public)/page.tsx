import { AboutSection } from "@/modules/landing/components/about"
import { FeaturesSection } from "@/modules/landing/components/features"
import { HeroSection } from "@/modules/landing/components/hero"
import { HowItWorksSection } from "@/modules/landing/components/how-it-works"
import { RolesSection } from "@/modules/landing/components/roles"
import { ServiceMarquee } from "@/modules/landing/components/service-marquee"

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ServiceMarquee />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RolesSection />
    </main>
  )
}
