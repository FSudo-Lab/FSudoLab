import { ContactSection } from '@/components/contact-section'
import { CookieConsent } from '@/components/cookie-consent'
import { HeroSection } from '@/components/hero-section'
import { IntroSection } from '@/components/intro-section'
import { LiquidGlass } from '@/components/liquid-glass'
import { Navbar } from '@/components/navbar'
import { PartnersSection } from '@/components/partners-section'
import { ProjectsSection } from '@/components/projects-section'
import { SiteFooter } from '@/components/site-footer'
import { MethodChapter } from '@/components/story/method-chapter'
import { SparkChapter } from '@/components/story/spark-chapter'
import { BlobStage } from '@/components/blob/BlobStage'
import { ChapterRail } from '@/components/story/chapter-rail'
import { SceneStepper } from '@/components/story/scene-stepper'
import { ServicesSection } from '@/components/services-section'
import { TeamSection } from '@/components/team-section'
import { VideoSection } from '@/components/video-section'
import { StorySection } from '@/components/story-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { SmoothScroll } from '@/components/story/smooth-scroll'

// Story order: intro (logo → name → blob, scroll-scrubbed) → hero (signature blob frames) → spark → method → work → services → people → circle → your turn.
// The signature blob in <BlobStage /> (styled like the hero blob) follows the reader through
// every chapter; <ChapterRail /> shows where you are in the story.
export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip text-[#11142f]">
      <BlobStage />
      <Navbar />
      <ChapterRail />
      <SceneStepper />
      <SmoothScroll />
      <IntroSection />
      <HeroSection />
      <SparkChapter />
      <MethodChapter />
      <ProjectsSection />
      <ServicesSection />
      <VideoSection />
      <TeamSection />
      <StorySection />
      <PartnersSection />
      <TestimonialsSection />
      <ContactSection />
      <CookieConsent />
      <LiquidGlass />
      <SiteFooter />
    </main>
  )
}
