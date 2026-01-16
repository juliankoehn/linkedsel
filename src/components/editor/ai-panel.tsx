'use client'

import { Coins, Sparkles, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CreditDisplay } from '@/components/credits/credit-display'
import { Button } from '@/components/ui/button'
import type { AIGenerationOptions } from '@/hooks/use-ai-generation'
import { useCredits } from '@/hooks/use-credits'
import { useSubscription } from '@/hooks/use-subscription'
import { useToast } from '@/hooks/use-toast'
import type { QualityTier } from '@/lib/ai/pipeline'
import { cn } from '@/lib/utils'
import type { BrandKit } from '@/types/brand-kit'

interface AIPanelProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (options: AIGenerationOptions) => void
  isGenerating: boolean
}

const STYLES = [
  {
    id: 'professional',
    label: 'Professionell',
    desc: 'Seriös und businesstauglich',
  },
  { id: 'casual', label: 'Locker', desc: 'Freundlich und nahbar' },
  {
    id: 'educational',
    label: 'Lehrreich',
    desc: 'Informativ und strukturiert',
  },
  {
    id: 'inspirational',
    label: 'Inspirierend',
    desc: 'Motivierend und emotional',
  },
] as const

const LANGUAGES = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
] as const

const QUALITY_TIERS = [
  {
    id: 'basic' as QualityTier,
    label: 'Basic',
    credits: 1,
    desc: 'Schnelle Generierung',
  },
  {
    id: 'standard' as QualityTier,
    label: 'Standard',
    credits: 2,
    desc: 'Multi-Step + Validation',
  },
  {
    id: 'premium' as QualityTier,
    label: 'Premium',
    credits: 4,
    desc: 'Beste Qualität + Auto-Fix',
  },
] as const

export function AIPanel({ isOpen, onClose, onGenerate, isGenerating }: AIPanelProps) {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState<(typeof STYLES)[number]['id']>('professional')
  const [quality, setQuality] = useState<QualityTier>('standard')
  const [slideCount, setSlideCount] = useState(5)
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null)
  const [brandKits, setBrandKits] = useState<BrandKit[]>([])
  const [isLoadingBrandKits, setIsLoadingBrandKits] = useState(false)

  const { isPro, isByok, hasSubscription } = useSubscription()
  const { creditsRemaining, isLoading: isLoadingCredits, refetch: refetchCredits } = useCredits()
  const { toast } = useToast()

  const canUseAI = isPro || isByok
  const selectedQualityTier = QUALITY_TIERS.find((q) => q.id === quality)
  const creditsRequired = selectedQualityTier?.credits ?? 1
  // BYOK users don't use platform credits
  const hasEnoughCredits = isByok || creditsRemaining >= creditsRequired

  // Load brand kits when panel opens
  useEffect(() => {
    if (isOpen && canUseAI) {
      setIsLoadingBrandKits(true)
      fetch('/api/brand-kits')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setBrandKits(data)
            // Auto-select first brand kit if available
            if (data.length > 0 && !brandKit) {
              setBrandKit(data[0])
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load brand kits:', err)
        })
        .finally(() => {
          setIsLoadingBrandKits(false)
        })
    }
  }, [isOpen, canUseAI, brandKit])

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Bitte gib ein Thema ein', variant: 'destructive' })
      return
    }

    if (!hasEnoughCredits && !isByok) {
      toast({
        title: 'Nicht genügend Credits',
        description: `Diese Generierung benötigt ${creditsRequired} Credit(s). Du hast ${creditsRemaining}.`,
        variant: 'destructive',
      })
      return
    }

    onGenerate({
      topic,
      style,
      slideCount,
      language,
      quality,
      brandKit,
    })

    // Refetch credits after generation starts (will be deducted on success)
    setTimeout(() => {
      refetchCredits()
    }, 5000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">AI Carousel Generator</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Show credits for Pro users, not for BYOK */}
            {canUseAI && !isByok && !isLoadingCredits && (
              <CreditDisplay credits={creditsRemaining} variant="compact" />
            )}
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isGenerating}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {!canUseAI ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                AI Content ist ein Premium Feature
              </h3>
              <p className="mt-2 text-gray-600">
                {hasSubscription
                  ? 'Füge deine API Keys in den Einstellungen hinzu um AI zu nutzen.'
                  : 'Upgrade auf Pro oder BYOK um AI Content Generation zu nutzen.'}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <a href={hasSubscription ? '/settings' : '/pricing'}>
                    {hasSubscription ? 'API Keys hinzufügen' : 'Upgrade'}
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Topic Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Thema / Inhalt
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="z.B. 5 Tipps für besseres Zeitmanagement, Die Zukunft von AI im Marketing, Warum Remote Work produktiver macht..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              {/* Style Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Stil</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      disabled={isGenerating}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-colors',
                        style === s.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300',
                        isGenerating && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <p className="font-medium text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Qualität</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUALITY_TIERS.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setQuality(q.id)}
                      disabled={isGenerating}
                      className={cn(
                        'rounded-lg border p-3 text-center transition-colors',
                        quality === q.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300',
                        isGenerating && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {q.id === 'premium' && <Zap className="h-3 w-3 text-yellow-500" />}
                        <p className="font-medium text-gray-900">{q.label}</p>
                      </div>
                      <p className="text-xs text-gray-500">{q.desc}</p>
                      <p className="mt-1 text-xs font-medium text-purple-600">
                        {q.credits} Credit{q.credits > 1 ? 's' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide Count, Language, Brand Kit */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Anzahl Slides
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    disabled={isGenerating}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} Slides
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Sprache</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
                    disabled={isGenerating}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Brand Kit</label>
                  <select
                    value={brandKit?.id || ''}
                    onChange={(e) => {
                      const selected = brandKits.find((bk) => bk.id === e.target.value)
                      setBrandKit(selected || null)
                    }}
                    disabled={isGenerating || isLoadingBrandKits}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Kein Brand Kit</option>
                    {brandKits.map((bk) => (
                      <option key={bk.id} value={bk.id}>
                        {bk.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand Kit Preview */}
              {brandKit && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Brand Kit: {brandKit.name}
                  </p>
                  <div className="flex gap-2">
                    {brandKit.colors.slice(0, 5).map((color) => (
                      <div
                        key={color.id}
                        className="h-6 w-6 rounded border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-sm text-purple-800">
                  <strong>Multi-Step Pipeline:</strong>{' '}
                  {quality === 'basic'
                    ? 'Schnelle Single-Pass Generierung.'
                    : quality === 'standard'
                      ? 'Content → Design → Layout → Validation in 4 Schritten.'
                      : 'Premium: 5 Schritte mit Auto-Refinement für beste Ergebnisse.'}
                </p>
              </div>

              {/* Credits Warning */}
              {!hasEnoughCredits && !isByok && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Coins className="h-4 w-4" />
                    <p className="text-sm font-medium">Nicht genügend Credits</p>
                  </div>
                  <p className="mt-1 text-xs text-amber-700">
                    Du benötigst {creditsRequired} Credit(s) für diese Generierung, hast aber nur{' '}
                    {creditsRemaining}. Wähle eine niedrigere Qualitätsstufe oder kaufe mehr
                    Credits.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim() || (!hasEnoughCredits && !isByok)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Carousel generieren
                {!isByok && (
                  <span className="ml-2 text-xs opacity-75">({creditsRequired} Credits)</span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
