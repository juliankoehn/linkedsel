'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'

export function EditorSidebar() {
  const { slides, currentSlideIndex, setCurrentSlide, addSlide } =
    useEditorStore()

  return (
    <aside className="flex w-48 flex-col rounded-lg border bg-white">
      <div className="border-b p-3">
        <h3 className="text-sm font-medium text-gray-900">Slides</h3>
      </div>

      <div className="flex-1 space-y-2 overflow-auto p-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              'aspect-[4/5] w-full rounded-md border-2 bg-gray-50 transition-colors',
              index === currentSlideIndex
                ? 'border-brand-500'
                : 'border-transparent hover:border-gray-300'
            )}
          >
            <span className="text-xs text-gray-500">{index + 1}</span>
          </button>
        ))}
      </div>

      <div className="border-t p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={addSlide}
        >
          <Plus className="mr-2 h-4 w-4" />
          Slide hinzufügen
        </Button>
      </div>
    </aside>
  )
}
