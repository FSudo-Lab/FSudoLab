import { ArrowUpRight } from 'lucide-react'
import { Spotlight } from '@/components/spotlight'
import { story } from '@/lib/story-content'

export function ContactSection() {
  const c = story.contact
  return (
    <section
      id="contact"
      data-bg={c.bg}
      data-theme="dark"
      data-blob-anchor="contact"
      className="relative z-[2] flex min-h-svh items-center px-6 py-24 text-white lg:px-10"
    >
      <Spotlight />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center [text-shadow:0_2px_28px_rgba(15,12,50,0.7)]">
        <p data-reveal className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0b7ff]">{c.chapter}</p>
        <h2 data-reveal className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">{c.title}</h2>
        <a data-reveal href={`mailto:${c.email}`} className="mt-10 w-fit rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#24265b] shadow-[0_12px_40px_rgba(20,10,60,0.35)] transition hover:bg-[#f1dcff] [text-shadow:none]">
          {c.email} <ArrowUpRight className="ml-2 inline h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
