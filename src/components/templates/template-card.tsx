'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { CarouselTemplate } from '@/types/templates'

interface TemplateCardProps {
  template: CarouselTemplate
  hasSubscription?: boolean
}

export function TemplateCard({ template, hasSubscription = false }: TemplateCardProps) {
  const isLocked = template.isPremium && !hasSubscription

  return (
    <Link
      href={isLocked ? '/pricing' : `/editor?template=${template.id}`}
      className={cn(
        'group relative block overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg',
        isLocked && 'cursor-not-allowed opacity-75'
      )}
    >
      {/* Thumbnail Preview */}
      <div className="relative aspect-[4/5] bg-gray-100">
        <TemplatePreview template={template} />

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-2 right-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                hasSubscription ? 'bg-brand-100 text-brand-700' : 'bg-gray-900 text-white'
              )}
            >
              {isLocked && <Lock className="h-3 w-3" />}
              Premium
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900">
            {isLocked ? 'Upgrade für Zugang' : 'Template verwenden'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{template.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{template.description}</p>

        {/* Color Preview */}
        <div className="mt-3 flex gap-1">
          {template.colors.map((color, index) => (
            <div
              key={index}
              className="h-4 w-4 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </Link>
  )
}

function TemplatePreview({ template }: { template: CarouselTemplate }) {
  const firstSlide = template.slides[0]
  if (!firstSlide) return null

  // Simple CSS-based preview
  return (
    <div
      className="flex h-full w-full items-center justify-center p-4"
      style={{ backgroundColor: firstSlide.backgroundColor }}
    >
      <div className="scale-[0.25] transform">
        {firstSlide.elements.map((element, index) => {
          if (element.type === 'text') {
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: element.props.left,
                  top: element.props.top,
                  fontSize: (element.props as { fontSize: number }).fontSize,
                  color: (element.props as { fill: string }).fill,
                  fontWeight: (element.props as { fontWeight?: string }).fontWeight || 'normal',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {(element.props as { text: string }).text}
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
