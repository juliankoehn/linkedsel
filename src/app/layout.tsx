import type { Metadata } from 'next'

import '@/app/globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    default: 'Stacked - LinkedIn Carousels mit KI erstellen',
    template: '%s | Stacked',
  },
  description:
    'Erstelle virale LinkedIn Carousels in Sekunden mit KI. Der schnellste Weg von der Idee zum fertigen Post. 100% auf LinkedIn optimiert.',
  keywords: [
    'LinkedIn Carousel',
    'KI Carousel Generator',
    'LinkedIn Content',
    'Social Media Marketing',
    'B2B Marketing',
    'Personal Branding',
    'Content Creation',
    'LinkedIn PDF',
    'Carousel Design',
  ],
  authors: [{ name: 'Stacked' }],
  creator: 'Stacked',
  metadataBase: new URL('https://stacked.ai'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    alternateLocale: 'en_US',
    url: 'https://stacked.ai',
    siteName: 'Stacked',
    title: 'Stacked - LinkedIn Carousels mit KI erstellen',
    description:
      'Erstelle virale LinkedIn Carousels in Sekunden mit KI. Der schnellste Weg von der Idee zum fertigen Post.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stacked - LinkedIn Carousel Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stacked - LinkedIn Carousels mit KI erstellen',
    description:
      'Erstelle virale LinkedIn Carousels in Sekunden mit KI. Der schnellste Weg von der Idee zum fertigen Post.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
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
