'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-xl font-bold text-foreground">Stacked</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Preise
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/auth/login">Anmelden</Link>
          </Button>
          <Button asChild className="bg-brand-500 hover:bg-brand-600 text-white">
            <Link href="/editor">Kostenlos starten</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/features"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Preise
            </Link>
            <div className="pt-4 space-y-2 border-t border-white/10">
              <Button
                variant="ghost"
                asChild
                className="w-full justify-start text-muted-foreground"
              >
                <Link href="/auth/login">Anmelden</Link>
              </Button>
              <Button asChild className="w-full bg-brand-500 hover:bg-brand-600 text-white">
                <Link href="/editor">Kostenlos starten</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
