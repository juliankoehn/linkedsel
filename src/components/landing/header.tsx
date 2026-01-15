import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-brand-600 text-xl font-bold">LinkedSel</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/features"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Preise
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Anmelden</Link>
          </Button>
          <Button asChild>
            <Link href="/editor">Starten</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
