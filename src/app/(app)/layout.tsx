'use client'

import type { ReactNode } from 'react'

import { AppHeader } from '@/components/app/header'
import { AppSidebar } from '@/components/app/sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
