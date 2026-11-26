'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const logoUrl = '/fsudolablogo.webp'
const navItems = [
  { label: 'About us', href: '#about-us' },
  { label: 'Services', href: '#services' },
  { label: 'Our team', href: '#insights' },
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

  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMenuOpen])

  // Any jump link (footer, hero…) also closes the phone menu.
  useEffect(() => {
    const close = () => setIsMenuOpen(false)
    window.addEventListener('fs:jump', close)
    return () => window.removeEventListener('fs:jump', close)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
    <nav aria-label="Main" data-lg-refract className="site-nav lg fixed z-50 flex min-h-[76px] items-center justify-between rounded-full px-4 py-2.5 sm:px-6 lg:px-8">
      <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="FSudoLab home">
        <Image src={logoUrl} alt="FSudoLab logo" width={64} height={64} className={`h-12 w-12 object-contain transition-[filter,transform] duration-500 ${hasPassedHero ? '' : 'brightness-0 drop-shadow-[0_0_1px_rgba(255,255,255,0.95)]'}`} priority />
        <span className={`nav-brand hidden origin-left text-lg font-semibold tracking-[-0.03em] text-[#11142f] transition-all duration-500 sm:block ${hasPassedHero ? 'translate-x-0 opacity-100' : '-translate-x-5 opacity-0'}`}>FSudoLab</span>
      </a>
      <div className="hidden items-center gap-8 text-sm font-semibold text-[#55566e] lg:flex xl:gap-10">
        {navItems.map((item) => (
          <a key={item.label} href={item.href} className="nav-link rounded-full px-1 py-2 transition-colors">
            {item.label}
          </a>
        ))}
      </div>
      <a href="#contact" className="hidden shrink-0 rounded-full md:ml-auto md:mr-3 lg:ml-0 lg:mr-0 bg-[#27275c] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(39,39,92,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#3b3383] md:block">
        Contact us <ArrowUpRight className="ml-1 inline h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        className="nav-menu-btn lg-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </nav>
    {isMenuOpen && (
      <div id="mobile-navigation" data-lg-refract className="nav-sheet lg lg-dark fixed z-50 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-3xl p-3 text-white lg:hidden">
        <div className="flex flex-col gap-2 text-[15px] font-medium">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} onClick={closeMenu} className="lg-chip flex min-h-12 items-center rounded-2xl px-4 py-3 text-base font-semibold text-white">
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={closeMenu} className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-white px-5 py-3 text-center text-[#24265b] font-semibold">
            Contact us <ArrowUpRight className="ml-1 inline h-4 w-4" />
          </a>
        </div>
      </div>
    )}
    </>
  )
}
