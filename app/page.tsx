import { AboutSection } from '@/components/about-section'
import { ContactSection } from '@/components/contact-section'
import { CookieConsent } from '@/components/cookie-consent'
import { HeroSection } from '@/components/hero-section'
import { Navbar } from '@/components/navbar'
import { PartnersSection } from '@/components/partners-section'
import { ProjectsSection } from '@/components/projects-section'
import { SiteFooter } from '@/components/site-footer'
import { VideoSection } from '@/components/video-section'

export default function Page() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfafc] text-[#11142f]">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <VideoSection />
      <ProjectsSection />
      <PartnersSection />
      <ContactSection />
      <CookieConsent />
      <SiteFooter />
    </main>
  )
}
