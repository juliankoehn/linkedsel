'use client'

import { useState } from 'react'

import { TemplateCard } from '@/components/templates/template-card'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'
import { DEFAULT_TEMPLATES } from '@/lib/templates/default-templates'
import { TEMPLATE_CATEGORIES, type TemplateCategory } from '@/types/templates'

type FilterCategory = TemplateCategory | 'all'

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>('all')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const { hasSubscription } = useSubscription()

  const filteredTemplates = DEFAULT_TEMPLATES.filter((template) => {
    const categoryMatch =
      selectedCategory === 'all' || template.category === selectedCategory
    const premiumMatch = !showPremiumOnly || template.isPremium
    return categoryMatch && premiumMatch
  })

  const categories: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'Alle' },
    ...Object.entries(TEMPLATE_CATEGORIES).map(([id, label]) => ({
      id: id as TemplateCategory,
      label,
    })),
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="mt-1 text-gray-600">
          Wähle ein Template als Startpunkt für dein Carousel
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <Button
          variant={showPremiumOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPremiumOnly(!showPremiumOnly)}
        >
          Nur Premium
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            hasSubscription={hasSubscription}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600">
            Keine Templates in dieser Kategorie gefunden.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSelectedCategory('all')
              setShowPremiumOnly(false)
            }}
          >
            Filter zurücksetzen
          </Button>
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {!hasSubscription && (
        <div className="from-brand-500 to-brand-600 rounded-lg bg-gradient-to-r p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Mehr Templates freischalten</h3>
              <p className="text-brand-100 mt-1">
                Mit Pro hast du Zugriff auf alle Premium Templates und kannst
                das Watermark entfernen.
              </p>
            </div>
            <Button
              variant="secondary"
              className="text-brand-600 hover:bg-brand-50 bg-white"
              asChild
            >
              <a href="/pricing">Upgrade auf Pro</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
