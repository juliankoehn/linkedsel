import { Download, FileText, Image, Layout, Lock, Palette, Sparkles, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Entdecke alle Features von Stacked - KI-generierte Carousels, Brand Kits, Premium Templates und mehr.',
}

const features = [
  {
    name: 'Drag & Drop Editor',
    description:
      'Intuitiver Canvas-Editor mit Drag & Drop. Verschiebe, skaliere und bearbeite Elemente wie in Profi-Tools.',
    icon: Layout,
    color: 'brand',
  },
  {
    name: 'Premium Templates',
    description:
      'Hunderte professionell gestaltete Templates für jeden Anwendungsfall - Business, Marketing, Personal Brand.',
    icon: FileText,
    color: 'accent',
  },
  {
    name: 'Bild-Upload',
    description:
      'Lade deine eigenen Bilder hoch und verwandle sie in beeindruckende Carousel-Slides.',
    icon: Image,
    color: 'brand',
  },
  {
    name: 'Brand Kits',
    description:
      'Speichere deine Markenfarben, Schriften und Logos. Ein Klick und alles ist konsistent.',
    icon: Palette,
    color: 'accent',
  },
  {
    name: 'AI Content Generation',
    description:
      'Lass dir Texte von KI generieren. Nutze deinen eigenen API-Key oder unseren Service.',
    icon: Sparkles,
    color: 'brand',
  },
  {
    name: 'PDF & PNG Export',
    description:
      'Exportiere deine Carousels als PDF (LinkedIn-kompatibel) oder einzelne PNG-Slides.',
    icon: Download,
    color: 'accent',
  },
  {
    name: 'Blitzschnell',
    description:
      'Von der Idee zum fertigen Carousel in unter 5 Minuten. Keine Ladezeiten, keine Verzögerungen.',
    icon: Zap,
    color: 'brand',
  },
  {
    name: 'Datenschutz',
    description: 'DSGVO-konform. Deine Daten gehören dir. Keine Weitergabe an Dritte.',
    icon: Lock,
    color: 'accent',
  },
]

export default function FeaturesPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Alles was du brauchst
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Professionelle LinkedIn Carousels erstellen - ohne Design-Kenntnisse
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  feature.color === 'brand' ? 'bg-brand-500/10' : 'bg-accent/10'
                }`}
              >
                <feature.icon
                  className={`h-6 w-6 ${
                    feature.color === 'brand' ? 'text-brand-400' : 'text-accent'
                  }`}
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600">
            <Link href="/editor">Jetzt kostenlos testen</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
