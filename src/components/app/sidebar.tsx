'use client'

import { LayoutDashboard, LayoutTemplate, Palette, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Templates', href: '/templates', icon: LayoutTemplate },
  { name: 'Brand Kits', href: '/brand-kits', icon: Palette },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-14 flex-shrink-0 border-r bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b">
        <Link href="/" className="text-lg font-bold text-blue-600">
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
                'group flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isActive ? 'bg-blue-50' : 'hover:bg-gray-100'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'stroke-blue-600' : 'stroke-gray-500 group-hover:stroke-gray-700'
                )}
              />
            </Link>
          )
        })}
      </nav>

      {/* Bottom section: Settings & User */}
      <div className="flex flex-col items-center gap-1 border-t py-3">
        <Link
          href="/settings"
          title="Einstellungen"
          className={cn(
            'group flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
            pathname.startsWith('/settings') ? 'bg-blue-50' : 'hover:bg-gray-100'
          )}
        >
          <Settings
            className={cn(
              'h-5 w-5 transition-colors',
              pathname.startsWith('/settings')
                ? 'stroke-blue-600'
                : 'stroke-gray-500 group-hover:stroke-gray-700'
            )}
          />
        </Link>
        <button
          title="Profil"
          className="group flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
        >
          <User className="h-5 w-5 stroke-gray-500 transition-colors group-hover:stroke-gray-700" />
        </button>
      </div>
    </aside>
  )
}
