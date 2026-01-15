'use client'

import Konva from 'konva'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
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
  const previewWidth = 160
  const previewHeight = previewWidth / aspectRatio
  const scale = previewWidth / preset.width

  const renderPreview = useCallback(() => {
    if (!containerRef.current) return

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
    slide.elements.forEach((element) => {
      renderElement(layer, element, scale)
    })

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
    <div className="group relative">
      <button
        onClick={onClick}
        className={cn(
          'relative w-full overflow-hidden rounded-md border-2 transition-colors',
          isActive
            ? 'border-blue-500 ring-2 ring-blue-200'
            : 'border-gray-200 hover:border-gray-300'
        )}
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        <div ref={containerRef} className="h-full w-full" />
        <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
          {slideIndex + 1}
        </span>
      </button>

      {/* Slide actions */}
      <div className="absolute top-1 -right-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleDuplicate}
          className="rounded bg-white p-1 shadow hover:bg-gray-100"
          title="Duplicate slide"
        >
          <Copy className="h-3 w-3" />
        </button>
        {slides.length > 1 && (
          <button
            onClick={handleDelete}
            className="rounded bg-white p-1 shadow hover:bg-red-50 hover:text-red-600"
            title="Delete slide"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// Helper function to render element in preview
function renderElement(layer: Konva.Layer, element: CanvasElement, scale: number) {
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
    <aside className="flex w-52 flex-col rounded-lg border bg-white">
      <div className="border-b p-3">
        <h3 className="text-sm font-medium text-gray-900">Slides ({slides.length})</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-3">
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

      <div className="border-t p-3">
        <Button variant="outline" size="sm" className="w-full" onClick={addSlide}>
          <Plus className="mr-2 h-4 w-4" />
          Add Slide
        </Button>
      </div>
    </aside>
  )
}
