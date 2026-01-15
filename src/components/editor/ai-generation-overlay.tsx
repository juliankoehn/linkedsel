'use client'

import { Loader2, Sparkles, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { AIGenerationState } from '@/hooks/use-ai-generation'

interface AIGenerationOverlayProps {
  state: AIGenerationState
  onCancel: () => void
}

export function AIGenerationOverlay({ state, onCancel }: AIGenerationOverlayProps) {
  if (!state.isGenerating) return null

  const progress =
    state.totalSlides > 0 ? Math.round((state.currentSlide / state.totalSlides) * 100) : 0

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Generation</h3>
              <p className="text-sm text-gray-500">Creating your carousel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              Slide {state.currentSlide} of {state.totalSlides}
            </span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status message */}
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          <span className="text-sm text-gray-600">{state.message}</span>
        </div>

        {/* Cancel button */}
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel Generation
        </Button>

        {/* Error state */}
        {state.error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </div>
        )}
      </div>
    </div>
  )
}
