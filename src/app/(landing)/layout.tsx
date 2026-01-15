import type { ReactNode } from 'react'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
