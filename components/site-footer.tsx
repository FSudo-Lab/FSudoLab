import { Spotlight } from '@/components/spotlight'
import { story } from '@/lib/story-content'

const links = [
  { label: 'The top', href: '#top' },
  { label: 'Services', href: '#services' },
  { label: 'Our team', href: '#insights' },
  { label: 'Partners', href: '#partners' },
  { label: 'Contact us', href: '#contact' },
]

// Srut-style ending: a row of links and studio details with a soft light that follows the mouse.
export function SiteFooter() {
  return (
    <footer className="site-footer relative z-[2] overflow-hidden bg-[#17193d] px-6 pt-10 pb-6 text-white lg:px-10">
      <Spotlight color="rgba(214, 130, 245, 0.2)" size={620} />
      <nav aria-label="Footer" className="relative flex flex-wrap justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="transition-colors hover:text-white">{l.label}</a>
        ))}
        <a href={`mailto:${story.contact.email}`} className="transition-colors hover:text-white">{story.contact.email}</a>
      </nav>
      <div className="relative mt-6 flex flex-col justify-between gap-2 text-xs text-white/45 sm:flex-row">
        <span>© 2026 FSudoLab. Built for what&apos;s next.</span>
        <span>Strategy · Design · Technology</span>
      </div>
    </footer>
  )
}
