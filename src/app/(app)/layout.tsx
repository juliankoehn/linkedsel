'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/app/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isEditor = pathname.startsWith('/editor')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AppSidebar />
      <main className={isEditor ? 'flex-1 overflow-hidden' : 'flex-1 overflow-auto p-6'}>
        {children}
      </main>
      <Toaster />
    </div>
  )
}
