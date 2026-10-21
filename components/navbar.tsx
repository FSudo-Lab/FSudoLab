'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const logoUrl = '/fsudolablogo.webp'
const navItems = [
  { label: 'About us', href: '#about-us' },
  { label: 'Insights', href: '#insights' },
  { label: 'Partners', href: '#partners' },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasPassedHero, setHasPassedHero] = useState(false)

  useEffect(() => {
    const updateLogoState = () => {
      const hero = document.getElementById('top')
      setHasPassedHero(hero ? hero.getBoundingClientRect().bottom <= 80 : false)
    }

    updateLogoState()
    window.addEventListener('scroll', updateLogoState, { passive: true })
    return () => window.removeEventListener('scroll', updateLogoState)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className="fixed inset-x-3 top-4 z-50 flex min-h-[76px] items-center justify-between rounded-full border border-white/45 bg-white/[0.08] px-4 py-2.5 shadow-[0_18px_45px_rgba(31,34,83,0.12),inset_0_1px_1px_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl backdrop-saturate-180 sm:inset-x-4 sm:px-6 lg:inset-x-5 lg:px-8">
      <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label="FSudoLab home">
        <Image src={logoUrl} alt="FSudoLab logo" width={64} height={64} className={`h-12 w-12 object-contain transition-[filter,transform] duration-500 ${hasPassedHero ? '' : 'brightness-0 drop-shadow-[0_0_1px_rgba(255,255,255,0.95)]'}`} priority />
        <span className={`hidden origin-left text-lg font-semibold tracking-[-0.03em] text-[#11142f] transition-all duration-500 sm:block ${hasPassedHero ? 'translate-x-0 opacity-100' : '-translate-x-5 opacity-0'}`}>FSudoLab</span>
      </a>
      <div className="hidden items-center gap-8 text-sm font-semibold text-[#55566e] lg:flex xl:gap-10">
        {navItems.map((item) => (
          <a key={item.label} href={item.href} className="transition-colors hover:text-[#11142f]">
            {item.label}
          </a>
        ))}
      </div>
      <a href="#contact" className="hidden shrink-0 rounded-full bg-[#27275c] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(39,39,92,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#3b3383] md:block">
        Contact us <ArrowUpRight className="ml-1 inline h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/20 text-[#11142f] shadow-[0_4px_14px_rgba(31,34,83,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-180 transition-colors hover:bg-white/30 md:hidden"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {isMenuOpen && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-[calc(100%+0.75rem)] rounded-3xl border border-white/45 bg-[rgba(24,27,68,0.94)] p-3 text-white shadow-[0_18px_45px_rgba(31,34,83,0.3),inset_0_1px_1px_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl backdrop-saturate-180 md:hidden">
          <div className="flex flex-col gap-1 text-[15px] font-medium">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={closeMenu} className="rounded-xl border border-white/30 bg-[rgba(74,52,135,0.58)] px-4 py-3 text-base font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-xl backdrop-saturate-180 transition-colors hover:bg-[rgba(105,67,175,0.72)] hover:text-white">
                {item.label}
              </a>
            ))}
            <a href="#contact" onClick={closeMenu} className="mt-2 rounded-full bg-[#27275c] px-5 py-3 text-center font-semibold text-white shadow-[0_8px_20px_rgba(39,39,92,0.28)]">
              Contact us <ArrowUpRight className="ml-1 inline h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
