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
    features: ['3 AI Credits pro Monat', 'Alle Templates', 'PDF Export', 'Watermark auf Exports'],
    cta: 'Kostenlos starten',
    featured: false,
  },
  {
    name: 'Pro',
    id: 'pro' as const,
    price: '19€',
    period: '/Monat',
    description: 'Für ambitionierte Creator',
    features: [
      '100 AI Credits pro Monat',
      'Alle Templates',
      'PDF Export ohne Watermark',
      'Brand Kits',
      'Premium Support',
    ],
    cta: 'Pro werden',
    featured: true,
  },
  {
    name: 'BYOK',
    id: 'byok' as const,
    price: '9€',
    period: '/Monat',
    description: 'Bring your own API Key',
    features: [
      'Unlimitierte Generierungen',
      'Eigene OpenAI API Keys',
      'Alle Pro Features',
      'Volle Datenkontrolle',
    ],
    cta: 'BYOK starten',
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Simple Preise</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Starte kostenlos, upgrade wenn du wächst
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'rounded-2xl border p-8',
                tier.featured
                  ? 'relative border-brand-500/50 bg-gradient-to-b from-brand-500/10 to-transparent'
                  : 'border-white/10 bg-white/[0.02]'
              )}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-sm font-medium text-white">
                  Beliebt
                </div>
              )}
              <h2 className="text-lg font-semibold text-foreground">{tier.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
              </div>

              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-brand-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {tier.id === 'free' ? (
                  <Button
                    asChild
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10"
                    variant="outline"
                  >
                    <Link href="/editor">{tier.cta}</Link>
                  </Button>
                ) : (
                  <CheckoutButton
                    plan={tier.id}
                    variant={tier.featured ? 'default' : 'outline'}
                    className={cn(
                      'w-full',
                      tier.featured
                        ? 'bg-brand-500 hover:bg-brand-600'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    )}
                  >
                    {tier.cta}
                  </CheckoutButton>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-muted-foreground">
            Alle Preise verstehen sich inklusive MwSt. Jederzeit kündbar.
          </p>
        </div>
      </div>
    </div>
  )
}
