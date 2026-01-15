'use client'

import * as fabric from 'fabric'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FORMAT_PRESETS, useEditorStore } from '@/stores/editor'

interface SlidePreviewProps {
  slideIndex: number
  isActive: boolean
  onClick: () => void
}

function SlidePreview({ slideIndex, isActive, onClick }: SlidePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.StaticCanvas | null>(null)
  const {
    slides,
    format,
    duplicateSlide,
    removeSlide,
    saveCurrentSlide,
    currentSlideIndex,
  } = useEditorStore()
  const slide = slides[slideIndex]

  const renderPreview = useCallback(() => {
    if (!canvasRef.current || !slide) return

    const preset = FORMAT_PRESETS[format]
    const aspectRatio = preset.width / preset.height
    const previewWidth = 160
    const previewHeight = previewWidth / aspectRatio
    const scale = previewWidth / preset.width

    if (!fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.StaticCanvas(canvasRef.current, {
        width: previewWidth,
        height: previewHeight,
        backgroundColor: slide.backgroundColor,
      })
    }

    const canvas = fabricCanvasRef.current
    canvas.clear()
    canvas.backgroundColor = slide.backgroundColor
    canvas.setDimensions({ width: previewWidth, height: previewHeight })

    // Clone and scale objects for preview
    slide.objects.forEach((obj) => {
      // Create a scaled clone for preview
      const clonedProps: Record<string, unknown> = {
        left: (obj.left || 0) * scale,
        top: (obj.top || 0) * scale,
        scaleX: (obj.scaleX || 1) * scale,
        scaleY: (obj.scaleY || 1) * scale,
        angle: obj.angle,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: (obj.strokeWidth || 0) * scale,
        selectable: false,
        evented: false,
      }

      if (obj instanceof fabric.IText) {
        const previewText = new fabric.FabricText(obj.text || '', {
          ...clonedProps,
          fontSize: (obj.fontSize || 16) * scale,
          fontFamily: obj.fontFamily,
          fontWeight: obj.fontWeight,
          fontStyle: obj.fontStyle,
        } as fabric.TextProps)
        canvas.add(previewText)
      } else if (obj instanceof fabric.Rect) {
        const previewRect = new fabric.Rect({
          ...clonedProps,
          width: (obj.width || 0) * scale,
          height: (obj.height || 0) * scale,
          rx: (obj.rx || 0) * scale,
          ry: (obj.ry || 0) * scale,
        } as fabric.RectProps)
        canvas.add(previewRect)
      } else if (obj instanceof fabric.Circle) {
        const previewCircle = new fabric.Circle({
          ...clonedProps,
          radius: (obj.radius || 0) * scale,
        } as fabric.CircleProps)
        canvas.add(previewCircle)
      } else if (obj instanceof fabric.FabricImage) {
        // For images, we need to handle them specially
        const imgElement = obj.getElement()
        if (imgElement) {
          const previewImg = new fabric.FabricImage(imgElement, {
            ...clonedProps,
          } as unknown as fabric.ImageProps)
          canvas.add(previewImg)
        }
      }
    })

    canvas.renderAll()
  }, [slide, format])

  useEffect(() => {
    // Save current slide before rendering preview to get latest state
    if (slideIndex === currentSlideIndex) {
      saveCurrentSlide()
    }
    renderPreview()

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [renderPreview, slideIndex, currentSlideIndex, saveCurrentSlide])

  // Re-render when slide changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (slideIndex === currentSlideIndex) {
        saveCurrentSlide()
      }
      renderPreview()
    }, 1000) // Update preview every second

    return () => clearInterval(interval)
  }, [renderPreview, slideIndex, currentSlideIndex, saveCurrentSlide])

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateSlide(slideIndex)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeSlide(slideIndex)
  }

  const preset = FORMAT_PRESETS[format]
  const aspectRatio = preset.width / preset.height

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
        <canvas ref={canvasRef} className="h-full w-full" />
        <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
          {slideIndex + 1}
        </span>
      </button>

      {/* Slide actions */}
      <div className="absolute top-1 -right-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleDuplicate}
          className="rounded bg-white p-1 shadow hover:bg-gray-100"
          title="Slide duplizieren"
        >
          <Copy className="h-3 w-3" />
        </button>
        {slides.length > 1 && (
          <button
            onClick={handleDelete}
            className="rounded bg-white p-1 shadow hover:bg-red-50 hover:text-red-600"
            title="Slide löschen"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export function EditorSidebar() {
  const { slides, currentSlideIndex, setCurrentSlide, addSlide } =
    useEditorStore()

  return (
    <aside className="flex w-52 flex-col rounded-lg border bg-white">
      <div className="border-b p-3">
        <h3 className="text-sm font-medium text-gray-900">
          Slides ({slides.length})
        </h3>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-3">
        {slides.map((slide, index) => (
          <SlidePreview
            key={slide.id}
            slideIndex={index}
            isActive={index === currentSlideIndex}
            onClick={() => setCurrentSlide(index)}
          />
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
