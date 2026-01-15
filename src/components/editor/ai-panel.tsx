'use client'

import { Loader2, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface GeneratedSlide {
  headline: string
  body: string
  callToAction?: string
}

interface AIGenerationResult {
  slides: GeneratedSlide[]
}

interface AIPanelProps {
  isOpen: boolean
  onClose: () => void
  onApply: (slides: GeneratedSlide[]) => void
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

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI (GPT-4)' },
  { id: 'anthropic', label: 'Anthropic (Claude)' },
] as const

export function AIPanel({ isOpen, onClose, onApply }: AIPanelProps) {
  const [topic, setTopic] = useState('')
  const [style, setStyle] =
    useState<(typeof STYLES)[number]['id']>('professional')
  const [slideCount, setSlideCount] = useState(5)
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<AIGenerationResult | null>(null)

  const { isPro, isByok, hasSubscription } = useSubscription()
  const { toast } = useToast()

  const canUseAI = isPro || isByok

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Bitte gib ein Thema ein', variant: 'destructive' })
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          style,
          slideCount,
          language,
          provider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation fehlgeschlagen')
      }

      setResult(data)
    } catch (error) {
      console.error('AI generation error:', error)
      toast({
        title: 'Fehler',
        description:
          error instanceof Error ? error.message : 'Generation fehlgeschlagen',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = () => {
    if (result?.slides) {
      onApply(result.slides)
      onClose()
      setResult(null)
      setTopic('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">AI Content Generator</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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
                />
              </div>

              {/* Style Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Stil
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-colors',
                        style === s.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <p className="font-medium text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide Count & Language */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Anzahl Slides
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} Slides
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Sprache
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    AI Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) =>
                      setProvider(e.target.value as 'openai' | 'anthropic')
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generiere...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Content generieren
                  </>
                )}
              </Button>

              {/* Results */}
              {result?.slides && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      Generierter Content ({result.slides.length} Slides)
                    </h3>
                    <Button onClick={handleApply}>Auf Carousel anwenden</Button>
                  </div>

                  <div className="max-h-64 space-y-3 overflow-auto rounded-lg border bg-gray-50 p-4">
                    {result.slides.map((slide, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-white p-3"
                      >
                        <p className="text-xs font-medium text-purple-600">
                          Slide {index + 1}
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {slide.headline}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {slide.body}
                        </p>
                        {slide.callToAction && (
                          <p className="mt-1 text-sm font-medium text-purple-600">
                            {slide.callToAction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
