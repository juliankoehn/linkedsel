import type { Metadata } from 'next'

import '@/app/globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    default: 'LinkedSel - LinkedIn Carousel Generator',
    template: '%s | LinkedSel',
  },
  description:
    'Create stunning LinkedIn carousels in minutes. Upload images or use templates to craft engaging carousel posts that drive engagement.',
  keywords: [
    'LinkedIn',
    'carousel',
    'generator',
    'social media',
    'content creation',
    'marketing',
  ],
  authors: [{ name: 'LinkedSel' }],
  creator: 'LinkedSel',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://linkedsel.com',
    siteName: 'LinkedSel',
    title: 'LinkedSel - LinkedIn Carousel Generator',
    description:
      'Create stunning LinkedIn carousels in minutes. Upload images or use templates to craft engaging carousel posts.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkedSel - LinkedIn Carousel Generator',
    description:
      'Create stunning LinkedIn carousels in minutes. Upload images or use templates to craft engaging carousel posts.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
