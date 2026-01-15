import { Download, FileText, Image, Layout, Lock, Palette, Sparkles, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Entdecke alle Features von LinkedSel - vom Editor bis zur AI-Unterstützung.',
}

const features = [
  {
    name: 'Drag & Drop Editor',
    description:
      'Intuitiver Canvas-Editor mit Drag & Drop. Verschiebe, skaliere und bearbeite Elemente wie in Profi-Tools.',
    icon: Layout,
  },
  {
    name: 'Premium Templates',
    description:
      'Hunderte professionell gestaltete Templates für jeden Anwendungsfall - Business, Marketing, Personal Brand.',
    icon: FileText,
  },
  {
    name: 'Bild-Upload',
    description:
      'Lade deine eigenen Bilder hoch und verwandle sie in beeindruckende Carousel-Slides.',
    icon: Image,
  },
  {
    name: 'Brand Kits',
    description:
      'Speichere deine Markenfarben, Schriften und Logos. Ein Klick und alles ist konsistent.',
    icon: Palette,
  },
  {
    name: 'AI Content Generation',
    description:
      'Lass dir Texte von KI generieren. Nutze deinen eigenen API-Key oder unseren Service.',
    icon: Sparkles,
  },
  {
    name: 'PDF & PNG Export',
    description:
      'Exportiere deine Carousels als PDF (LinkedIn-kompatibel) oder einzelne PNG-Slides.',
    icon: Download,
  },
  {
    name: 'Blitzschnell',
    description:
      'Von der Idee zum fertigen Carousel in unter 5 Minuten. Keine Ladezeiten, keine Verzögerungen.',
    icon: Zap,
  },
  {
    name: 'Datenschutz',
    description: 'DSGVO-konform. Deine Daten gehören dir. Keine Weitergabe an Dritte.',
    icon: Lock,
  },
]

export default function FeaturesPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Alles was du brauchst</h1>
          <p className="mt-4 text-lg text-gray-600">
            Professionelle LinkedIn Carousels erstellen - ohne Design-Kenntnisse
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="rounded-lg border bg-white p-6">
              <div className="bg-brand-100 flex h-12 w-12 items-center justify-center rounded-lg">
                <feature.icon className="text-brand-600 h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg">
            <Link href="/editor">Jetzt kostenlos testen</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
