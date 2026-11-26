import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FSudoLab',
  description: 'FSUDO Lab is a digital innovation studio turning complex challenges into clear, useful, and beautifully engineered experiences.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/fsudolablogo.webp', type: 'image/webp' }],
    apple: [{ url: '/fsudolablogo.webp', type: 'image/webp' }],
  },
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: browser extensions (password managers, translators, dark-mode
    // add-ons) add attributes to <html>/<body> before React loads, which Next.js reports as an
    // "Issue" in development. This only ignores attribute differences on these two tags.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
