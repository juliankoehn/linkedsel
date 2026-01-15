'use client'

import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Willkommen zurück! Hier sind deine Projekte.
          </p>
        </div>
        <Button asChild>
          <Link href="/editor">
            <Plus className="mr-2 h-4 w-4" />
            Neues Carousel
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Keine Projekte
        </h3>
        <p className="mt-2 text-gray-600">
          Erstelle dein erstes LinkedIn Carousel.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/editor">
              <Plus className="mr-2 h-4 w-4" />
              Carousel erstellen
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
