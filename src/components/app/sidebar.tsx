'use client'

import { LayoutDashboard, LayoutTemplate, Palette, PenTool, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Editor', href: '/editor', icon: PenTool },
  { name: 'Templates', href: '/templates', icon: LayoutTemplate },
  { name: 'Brand Kits', href: '/brand-kits', icon: Palette },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-14 flex-shrink-0 border-r bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b">
        <Link href="/" className="text-brand-600 text-lg font-bold">
          L
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-1 py-3">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t py-3">
        <Link
          href="/settings"
          title="Einstellungen"
          className={cn(
            'mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-brand-50 text-brand-600'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          )}
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </aside>
  )
}
