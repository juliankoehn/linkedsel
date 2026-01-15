'use client'

import type Konva from 'konva'
import { ArrowDown, ArrowUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { FORMAT_PRESETS, useCanvasStore } from '@/stores/canvas-store'
import { type CanvasElement, type Slide, useSlidesStore } from '@/stores/slides-store'

interface SlidePreviewProps {
  slide: Slide
  slideIndex: number
  isActive: boolean
  onClick: () => void
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
  isDragging: boolean
  isDragOver: boolean
}

function SlidePreview({
  slide,
  slideIndex,
  isActive,
  onClick,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver,
}: SlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const { format } = useCanvasStore()
  const { slides, duplicateSlide, deleteSlide, reorderSlides } = useSlidesStore()

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

  const handleDuplicate = () => {
    duplicateSlide(slideIndex)
  }

  const handleDelete = () => {
    if (slides.length > 1) {
      deleteSlide(slideIndex)
    }
  }

  const handleMoveUp = () => {
    if (slideIndex > 0) {
      reorderSlides(slideIndex, slideIndex - 1)
    }
  }

  const handleMoveDown = () => {
    if (slideIndex < slides.length - 1) {
      reorderSlides(slideIndex, slideIndex + 1)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(slideIndex))
    onDragStart(slideIndex)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    onDragOver(slideIndex)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'group relative flex items-center gap-1 rounded-md p-1 transition-all',
            isDragging && 'opacity-50',
            isDragOver && 'bg-blue-50 ring-2 ring-blue-300'
          )}
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={onDragEnd}
        >
          {/* Drag handle */}
          <div className="cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
            <GripVertical className="h-3 w-3" />
          </div>

          {/* Slide number */}
          <span className="w-3 text-center text-[10px] font-medium text-gray-400">
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
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-40">
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-3.5 w-3.5" />
          Duplizieren
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleMoveUp} disabled={slideIndex === 0}>
          <ArrowUp className="mr-2 h-3.5 w-3.5" />
          Nach oben
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMoveDown} disabled={slideIndex === slides.length - 1}>
          <ArrowDown className="mr-2 h-3.5 w-3.5" />
          Nach unten
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={handleDelete}
          disabled={slides.length <= 1}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Löschen
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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
  const { slides, currentSlideIndex, setCurrentSlide, addSlide, reorderSlides } = useSlidesStore()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (index: number) => {
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      reorderSlides(dragIndex, dragOverIndex)
      // Update current slide index if needed
      if (currentSlideIndex === dragIndex) {
        setCurrentSlide(dragOverIndex)
      }
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

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
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-1">
        {slides.map((slide, index) => (
          <SlidePreview
            key={slide.id}
            slide={slide}
            slideIndex={index}
            isActive={index === currentSlideIndex}
            onClick={() => setCurrentSlide(index)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragging={dragIndex === index}
            isDragOver={dragOverIndex === index && dragIndex !== index}
          />
        ))}
      </div>
    </aside>
  )
}
