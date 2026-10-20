import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FSudoLab — Make bold ideas real',
  description: 'FSUDO Lab is a digital innovation studio turning complex challenges into clear, useful, and beautifully engineered experiences.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/fsudolablogo.webp', type: 'image/webp' }],
    apple: [{ url: '/fsudolablogo.webp', type: 'image/webp' }],
  },
}

export const viewport: Viewport = {
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
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
