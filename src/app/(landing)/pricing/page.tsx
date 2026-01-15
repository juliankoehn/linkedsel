import { Check } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { CheckoutButton } from '@/components/checkout-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Preise',
  description:
    'Wähle den Plan der zu dir passt. Kostenlos starten, upgraden wenn du mehr brauchst.',
}

const tiers = [
  {
    name: 'Free',
    id: 'free' as const,
    price: '0€',
    description: 'Perfekt zum Ausprobieren',
    features: [
      'Unbegrenzte Carousels',
      'Alle Basic Templates',
      'PDF Export',
      'Watermark auf Exports',
    ],
    cta: 'Kostenlos starten',
    featured: false,
  },
  {
    name: 'Pro',
    id: 'pro' as const,
    price: '9€',
    period: '/Monat',
    description: 'Für Content Creator',
    features: [
      'Alles aus Free',
      'Kein Watermark',
      'Premium Templates',
      'Brand Kits',
      'AI Content Generation',
      'Priority Support',
    ],
    cta: 'Pro werden',
    featured: true,
  },
  {
    name: 'BYOK',
    id: 'byok' as const,
    price: '4€',
    period: '/Monat',
    description: 'Bring Your Own Key',
    features: [
      'Alles aus Free',
      'Kein Watermark',
      'Premium Templates',
      'Brand Kits',
      'Eigener AI API Key',
      'Niedrigere Kosten',
    ],
    cta: 'Mit eigenem Key starten',
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Einfache, transparente Preise
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Starte kostenlos. Upgrade wenn du mehr brauchst.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'rounded-2xl border bg-white p-8 shadow-sm',
                tier.featured && 'border-brand-500 ring-brand-500 ring-1'
              )}
            >
              {tier.featured && (
                <p className="text-brand-600 mb-4 text-sm font-semibold">
                  Beliebteste Wahl
                </p>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{tier.name}</h2>
              <p className="mt-2 text-gray-600">{tier.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-gray-600">{tier.period}</span>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="text-brand-500 h-5 w-5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {tier.id === 'free' ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/editor">{tier.cta}</Link>
                  </Button>
                ) : (
                  <CheckoutButton
                    plan={tier.id}
                    variant={tier.featured ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {tier.cta}
                  </CheckoutButton>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-gray-600">
            Alle Preise verstehen sich inklusive MwSt. Jederzeit kündbar.
          </p>
        </div>
      </div>
    </div>
  )
}
