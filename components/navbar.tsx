import Image from 'next/image'
import { ArrowUpRight, Menu } from 'lucide-react'

const logoUrl = '/fsudolablogo.webp'
const navItems = [
  { label: 'About us', href: '#about-us' },
  { label: 'Insights', href: '#video' },
  { label: 'Projects', href: '#partners' },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex min-h-[76px] w-full items-center justify-between border-b border-[#e7e7ef] bg-white px-5 py-3 shadow-[0_8px_24px_rgba(31,34,83,0.08)] lg:px-7">
      <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label="FSudoLab home">
        <Image src={logoUrl} alt="FSudoLab logo" width={47} height={47} className="h-10 w-10 object-contain mix-blend-multiply" priority />
        <span className="text-sm font-bold tracking-[0.2em] text-[#202456] sm:text-[15px]">FSudoLab</span>
      </a>
      <div className="hidden items-center gap-12 text-[15px] font-medium text-[#30324e] md:flex">
        {navItems.map((item) => (
          <a key={item.label} href={item.href} className="transition-colors hover:text-[#8b25cf]">
            {item.label}
          </a>
        ))}
      </div>
      <a href="#contact" className="hidden shrink-0 rounded-full bg-[#202456] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(32,36,86,0.2)] transition-transform hover:-translate-y-0.5 md:block">
        Let&apos;s talk <ArrowUpRight className="ml-1 inline h-4 w-4" />
      </a>
      <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e7e7ef] bg-white text-[#202456] shadow-[0_5px_16px_rgba(31,34,83,0.1)] md:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
    </nav>
  )
}
