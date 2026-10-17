import { AboutSection } from "@/modules/landing/components/about"
import { HeroSection } from "@/modules/landing/components/hero"
import { ServiceMarquee } from "@/modules/landing/components/service-marquee"

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ServiceMarquee />
      <AboutSection />
    </main>
  )
}
