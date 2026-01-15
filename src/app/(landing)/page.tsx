import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="from-brand-50 relative overflow-hidden bg-gradient-to-b to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              LinkedIn Carousels erstellen,{' '}
              <span className="text-brand-600">die begeistern</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Erstelle professionelle LinkedIn Carousel-Posts in Minuten. Lade
              Bilder hoch oder nutze unsere Templates - exportiere als PDF und
              steigere dein Engagement.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Button asChild size="lg">
                <Link href="/editor">
                  Jetzt starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/features">Mehr erfahren</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Alles was du brauchst
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Professionelle Carousels ohne Design-Kenntnisse
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-8 shadow-sm">
              <div className="bg-brand-100 flex h-12 w-12 items-center justify-center rounded-lg">
                <Zap className="text-brand-600 h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Blitzschnell
              </h3>
              <p className="mt-2 text-gray-600">
                Von der Idee zum fertigen Carousel in unter 5 Minuten. Drag &
                Drop macht es einfach.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8 shadow-sm">
              <div className="bg-brand-100 flex h-12 w-12 items-center justify-center rounded-lg">
                <Sparkles className="text-brand-600 h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                KI-Unterstützung
              </h3>
              <p className="mt-2 text-gray-600">
                Lass dir Texte generieren oder nutze deinen eigenen API-Key für
                maximale Flexibilität.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8 shadow-sm">
              <div className="bg-brand-100 flex h-12 w-12 items-center justify-center rounded-lg">
                <Shield className="text-brand-600 h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Brand Kits
              </h3>
              <p className="mt-2 text-gray-600">
                Speichere deine Markenfarben und Schriften. Ein Klick und alles
                ist konsistent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Bereit durchzustarten?
            </h2>
            <p className="text-brand-100 mt-4 text-lg">
              Kostenlos starten - keine Kreditkarte erforderlich.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-brand-600 hover:bg-brand-50 bg-white"
              >
                <Link href="/editor">Jetzt kostenlos erstellen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
