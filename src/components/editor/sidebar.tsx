'use client'

import type Konva from 'konva'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import { FORMAT_PRESETS, useCanvasStore } from '@/stores/canvas-store'
import { type CanvasElement, type Slide, useSlidesStore } from '@/stores/slides-store'

interface SlidePreviewProps {
  slide: Slide
  slideIndex: number
  isActive: boolean
  onClick: () => void
}

function SlidePreview({ slide, slideIndex, isActive, onClick }: SlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const { format } = useCanvasStore()
  const { slides, duplicateSlide, deleteSlide } = useSlidesStore()

  const preset = FORMAT_PRESETS[format]
  const aspectRatio = preset.width / preset.height
  const previewWidth = 80
  const previewHeight = previewWidth / aspectRatio
  const scale = previewWidth / preset.width

  const renderPreview = useCallback(async () => {
    if (!containerRef.current) return

    // Dynamic import to avoid SSR issues
    const KonvaModule = await import('konva')
    const Konva = KonvaModule.default

    // Initialize stage if needed
    if (!stageRef.current) {
      stageRef.current = new Konva.Stage({
        container: containerRef.current,
        width: previewWidth,
        height: previewHeight,
      })
    }

    const stage = stageRef.current
    stage.destroyChildren()
    stage.width(previewWidth)
    stage.height(previewHeight)

    const layer = new Konva.Layer()
    stage.add(layer)

    // Background
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: previewWidth,
      height: previewHeight,
      fill: slide.backgroundColor,
    })
    layer.add(background)

    // Render elements
    for (const element of slide.elements) {
      await renderElement(layer, element, scale)
    }

    layer.batchDraw()
  }, [slide, previewHeight, scale])

  useEffect(() => {
    renderPreview()

    return () => {
      if (stageRef.current) {
        stageRef.current.destroy()
        stageRef.current = null
      }
    }
  }, [renderPreview])

  // Re-render periodically for the active slide to capture changes
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(renderPreview, 1000)
    return () => clearInterval(interval)
  }, [isActive, renderPreview])

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateSlide(slideIndex)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteSlide(slideIndex)
  }

  return (
    <div className="group relative flex items-center gap-2">
      {/* Slide number */}
      <span className="w-4 text-center text-[10px] font-medium text-gray-400">
        {slideIndex + 1}
      </span>

      {/* Thumbnail */}
      <button
        onClick={onClick}
        className={cn(
          'relative flex-1 overflow-hidden rounded transition-all',
          isActive
            ? 'ring-2 ring-blue-500 ring-offset-1'
            : 'ring-1 ring-gray-200 hover:ring-gray-300'
        )}
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        <div ref={containerRef} className="h-full w-full" />
      </button>

      {/* Actions on hover */}
      <div className="absolute -right-1 top-1/2 flex -translate-y-1/2 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleDuplicate}
          className="rounded bg-white/90 p-1 shadow-sm backdrop-blur hover:bg-white"
          title="Duplicate"
        >
          <Copy className="h-2.5 w-2.5 text-gray-600" />
        </button>
        {slides.length > 1 && (
          <button
            onClick={handleDelete}
            className="rounded bg-white/90 p-1 shadow-sm backdrop-blur hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-2.5 w-2.5 text-gray-600 hover:text-red-600" />
          </button>
        )}
      </div>
    </div>
  )
}

// Helper function to render element in preview
async function renderElement(layer: Konva.Layer, element: CanvasElement, scale: number) {
  const KonvaModule = await import('konva')
  const Konva = KonvaModule.default

  const scaledProps = {
    x: element.x * scale,
    y: element.y * scale,
    width: element.width * scale,
    height: element.height * scale,
    rotation: element.rotation,
    opacity: element.opacity,
    visible: element.visible,
    listening: false,
  }

  switch (element.type) {
    case 'text': {
      const text = new Konva.Text({
        ...scaledProps,
        text: element.text,
        fontSize: element.fontSize * scale,
        fontFamily: element.fontFamily,
        fontStyle: `${element.fontWeight} ${element.fontStyle}`,
        fill: element.fill,
        align: element.textAlign,
      })
      layer.add(text)
      break
    }
    case 'rect': {
      const rect = new Konva.Rect({
        ...scaledProps,
        fill: element.fill,
        stroke: element.stroke,
        strokeWidth: element.strokeWidth ? element.strokeWidth * scale : 0,
        cornerRadius: element.cornerRadius ? element.cornerRadius * scale : 0,
      })
      layer.add(rect)
      break
    }
    case 'circle': {
      const circle = new Konva.Circle({
        x: (element.x + element.radius) * scale,
        y: (element.y + element.radius) * scale,
        radius: element.radius * scale,
        fill: element.fill,
        stroke: element.stroke,
        strokeWidth: element.strokeWidth ? element.strokeWidth * scale : 0,
        rotation: element.rotation,
        opacity: element.opacity,
        visible: element.visible,
        listening: false,
      })
      layer.add(circle)
      break
    }
    case 'image': {
      // For preview, show a placeholder rect for images
      const placeholder = new Konva.Rect({
        ...scaledProps,
        fill: '#f0f0f0',
        stroke: '#e0e0e0',
        strokeWidth: 1,
      })
      layer.add(placeholder)

      // Try to load the actual image
      const imageObj = new window.Image()
      imageObj.crossOrigin = 'anonymous'
      imageObj.onload = () => {
        const img = new Konva.Image({
          ...scaledProps,
          image: imageObj,
        })
        placeholder.destroy()
        layer.add(img)
        layer.batchDraw()
      }
      imageObj.src = element.src
      break
    }
  }
}

export function EditorSidebar() {
  const { slides, currentSlideIndex, setCurrentSlide, addSlide } = useSlidesStore()

  return (
    <aside className="flex h-full w-32 flex-col rounded-lg border bg-white/95 shadow-lg backdrop-blur">
      {/* Header with count and add button */}
      <div className="flex shrink-0 items-center justify-between border-b px-2 py-1.5">
        <span className="text-[10px] font-medium text-gray-500">{slides.length} Slides</span>
        <button
          onClick={addSlide}
          className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="Add Slide"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Slides list */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
        {slides.map((slide, index) => (
          <SlidePreview
            key={slide.id}
            slide={slide}
            slideIndex={index}
            isActive={index === currentSlideIndex}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </aside>
  )
}
