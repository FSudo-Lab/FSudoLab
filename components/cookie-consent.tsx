'use client'

import { useEffect, useState } from 'react'

const consentKey = 'fsudolab-cookie-consent'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(consentKey) !== 'accepted')
  }, [])

  const acceptCookies = () => {
    window.localStorage.setItem(consentKey, 'accepted')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <aside data-lg-refract className="lg lg-dark fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-2xl flex-col gap-4 rounded-3xl p-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-xl text-sm leading-6 text-white/85">We use cookies to remember your preferences and help the site load smoothly on future visits.</p>
      <button type="button" onClick={acceptCookies} className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#242653] transition hover:bg-[#f1dcff]">Accept cookies</button>
    </aside>
  )
}