'use client'

import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { ChevronLeft, ChevronRight, Copy, Minus, Plus, Square, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Layer, Rect, Stage } from 'react-konva'

import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateSnap, getElementsInRect } from '@/lib/konva/snap-utils'
import { DISPLAY_SCALE_FACTOR, useCanvasStore } from '@/stores/canvas-store'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import { useSlidesStore } from '@/stores/slides-store'

import { ElementRenderer } from './konva-elements'
import { SelectionRect } from './selection/selection-rect'
import { SelectionTransformer } from './selection/transformer'
import { SnapLines } from './snapping/snap-lines'
import { TextOverlay } from './text-editor/text-overlay'

// Gap between slides
const SLIDE_GAP = 60
const TOOLBAR_HEIGHT = 40

interface SlideToolbarProps {
  slideIndex: number
  totalSlides: number
  onDelete: () => void
  onDuplicate: () => void
  onAddBlank: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}

function SlideToolbar({
  slideIndex,
  totalSlides,
  onDelete,
  onDuplicate,
  onAddBlank,
  onMoveLeft,
  onMoveRight,
}: SlideToolbarProps) {
  const isFirst = slideIndex === 0
  const isLast = slideIndex === totalSlides - 1
  const canDelete = totalSlides > 1

  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute -top-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-white px-1 py-0.5 shadow-sm">
        {!isFirst && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onMoveLeft}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Nach links</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDelete}
              disabled={!canDelete}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Löschen</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDuplicate}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Copy className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Duplizieren</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onAddBlank}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Square className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Leere Slide einfügen</TooltipContent>
        </Tooltip>

        {!isLast && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onMoveRight}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Nach rechts</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

export function KonvaCanvas() {
  const stageRefs = useRef<Map<number, Konva.Stage>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const selectionStartRef = useRef<{ x: number; y: number; slideIndex: number } | null>(null)

  // Infinite canvas state - transform based (like react-flow)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  // Stores
  const { setStageRef, getDimensions, snapEnabled, setGuidelines, clearGuidelines, zoom, setZoom } =
    useCanvasStore()

  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
    updateElement,
    updateElements,
    deleteElements,
    getCurrentSlide,
  } = useSlidesStore()

  const {
    selectedIds,
    select,
    selectMultiple,
    clearSelection,
    setSelectionRect,
    setIsMultiSelecting,
    editingTextId,
  } = useSelectionStore()

  const { pushState } = useHistoryStore()
  const { markDirty, saveProject } = useProjectStore()

  const currentSlide = slides[currentSlideIndex]
  const { width, height } = getDimensions()

  const scaledWidth = width * DISPLAY_SCALE_FACTOR
  const scaledHeight = height * DISPLAY_SCALE_FACTOR

  // Calculate initial pan to center first slide on mount
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current || !containerRef.current) return
    hasInitialized.current = true

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Center the first slide
    const initialPanX = (containerWidth - scaledWidth * zoom) / 2
    const initialPanY = (containerHeight - scaledHeight * zoom) / 2

    setPanX(initialPanX)
    setPanY(Math.max(60, initialPanY)) // Leave space for toolbar
  }, [scaledWidth, scaledHeight, zoom])

  // Center on current slide when it changes
  useEffect(() => {
    if (!containerRef.current || !hasInitialized.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate where the current slide is in content space
    const slideX = currentSlideIndex * (scaledWidth + SLIDE_GAP)

    // Center that slide
    const targetPanX = (containerWidth - scaledWidth * zoom) / 2 - slideX * zoom
    const targetPanY = (containerHeight - scaledHeight * zoom) / 2

    setPanX(targetPanX)
    setPanY(Math.max(60, targetPanY))
  }, [currentSlideIndex, scaledWidth, scaledHeight, zoom])

  // Set stage ref in store for the current slide
  useEffect(() => {
    const stageRef = stageRefs.current.get(currentSlideIndex)
    if (stageRef) {
      setStageRef({ current: stageRef } as React.RefObject<Konva.Stage | null>)
    }
  }, [currentSlideIndex, setStageRef, slides])

  // Handle element selection
  const handleSelect = useCallback(
    (id: string, e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.shiftKey) {
        const currentSelection = selectedIds.includes(id)
          ? selectedIds.filter((s) => s !== id)
          : [...selectedIds, id]
        selectMultiple(currentSelection)
      } else {
        select(id)
      }
      e.cancelBubble = true
    },
    [selectedIds, select, selectMultiple]
  )

  // Handle drag operations with snapping
  const handleDragStart = useCallback(
    (id: string) => {
      pushState(slides)
      if (!selectedIds.includes(id)) {
        select(id)
      }
    },
    [pushState, slides, selectedIds, select]
  )

  const handleDragMove = useCallback(
    (id: string, x: number, y: number) => {
      if (!currentSlide || !snapEnabled) {
        updateElement(id, { x, y })
        return
      }

      const element = currentSlide.elements.find((el) => el.id === id)
      if (!element) return

      const tempElement = { ...element, x, y }
      const {
        x: snappedX,
        y: snappedY,
        guidelines,
      } = calculateSnap(tempElement, currentSlide.elements, width, height)

      setGuidelines(guidelines)
      updateElement(id, { x: snappedX, y: snappedY })
    },
    [currentSlide, snapEnabled, width, height, updateElement, setGuidelines]
  )

  const handleDragEnd = useCallback(() => {
    clearGuidelines()
    markDirty()
  }, [clearGuidelines, markDirty])

  // Handle transform end
  const handleTransformEnd = useCallback(
    (
      updates: Array<{
        id: string
        x: number
        y: number
        width: number
        height: number
        rotation: number
      }>
    ) => {
      updateElements(
        updates.map((u) => ({
          id: u.id,
          changes: {
            x: u.x,
            y: u.y,
            width: u.width,
            height: u.height,
            rotation: u.rotation,
          },
        }))
      )
      markDirty()
    },
    [updateElements, markDirty]
  )

  // Handle stage click on specific slide
  const handleStageClick = useCallback(
    (slideIndex: number, e: KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        clearSelection()
        if (currentSlideIndex !== slideIndex) {
          setCurrentSlide(slideIndex)
        }
      }
    },
    [clearSelection, currentSlideIndex, setCurrentSlide]
  )

  // Selection rectangle handlers
  const handleStageMouseDown = useCallback(
    (slideIndex: number, e: KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) return

      // Set this slide as current if not already
      if (currentSlideIndex !== slideIndex) {
        setCurrentSlide(slideIndex)
      }

      const stage = stageRefs.current.get(slideIndex)
      if (!stage) return

      const pos = stage.getPointerPosition()
      if (!pos) return

      const adjustedPos = {
        x: pos.x / zoom,
        y: pos.y / zoom,
      }

      selectionStartRef.current = { ...adjustedPos, slideIndex }
      setIsMultiSelecting(true)
      setSelectionRect({ x: adjustedPos.x, y: adjustedPos.y, width: 0, height: 0 })
    },
    [zoom, currentSlideIndex, setCurrentSlide, setIsMultiSelecting, setSelectionRect]
  )

  const handleStageMouseMove = useCallback(
    (slideIndex: number) => {
      if (!selectionStartRef.current || selectionStartRef.current.slideIndex !== slideIndex) return

      const stage = stageRefs.current.get(slideIndex)
      if (!stage) return

      const pos = stage.getPointerPosition()
      if (!pos) return

      const adjustedPos = {
        x: pos.x / zoom,
        y: pos.y / zoom,
      }

      const start = selectionStartRef.current
      const rect = {
        x: Math.min(start.x, adjustedPos.x),
        y: Math.min(start.y, adjustedPos.y),
        width: Math.abs(adjustedPos.x - start.x),
        height: Math.abs(adjustedPos.y - start.y),
      }

      setSelectionRect(rect)
    },
    [zoom, setSelectionRect]
  )

  const handleStageMouseUp = useCallback(
    (slideIndex: number) => {
      if (!selectionStartRef.current || selectionStartRef.current.slideIndex !== slideIndex) {
        setIsMultiSelecting(false)
        setSelectionRect(null)
        selectionStartRef.current = null
        return
      }

      const slide = slides[slideIndex]
      const stage = stageRefs.current.get(slideIndex)
      if (!stage || !slide) return

      const pos = stage.getPointerPosition()
      if (!pos) {
        setIsMultiSelecting(false)
        setSelectionRect(null)
        selectionStartRef.current = null
        return
      }

      const adjustedPos = {
        x: pos.x / zoom,
        y: pos.y / zoom,
      }

      const start = selectionStartRef.current
      const rect = {
        x: Math.min(start.x, adjustedPos.x),
        y: Math.min(start.y, adjustedPos.y),
        width: Math.abs(adjustedPos.x - start.x),
        height: Math.abs(adjustedPos.y - start.y),
      }

      if (rect.width > 5 && rect.height > 5) {
        const ids = getElementsInRect(slide.elements, rect)
        if (ids.length > 0) {
          selectMultiple(ids)
        }
      }

      setIsMultiSelecting(false)
      setSelectionRect(null)
      selectionStartRef.current = null
    },
    [slides, zoom, selectMultiple, setIsMultiSelecting, setSelectionRect]
  )

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(Math.min(3, zoom * 1.2))
  }, [zoom, setZoom])

  const zoomOut = useCallback(() => {
    setZoom(Math.max(0.1, zoom / 1.2))
  }, [zoom, setZoom])

  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [setZoom])

  // Slide actions
  const handleDeleteSlide = useCallback(
    (index: number) => {
      if (slides.length > 1) {
        pushState(slides)
        deleteSlide(index)
        markDirty()
      }
    },
    [slides, pushState, deleteSlide, markDirty]
  )

  const handleDuplicateSlide = useCallback(
    (index: number) => {
      pushState(slides)
      duplicateSlide(index)
      markDirty()
    },
    [slides, pushState, duplicateSlide, markDirty]
  )

  const handleAddBlankAfter = useCallback(
    (index: number) => {
      pushState(slides)
      addSlide()
      if (index < slides.length - 1) {
        reorderSlides(slides.length, index + 1)
      }
      setCurrentSlide(index + 1)
      markDirty()
    },
    [slides, pushState, addSlide, reorderSlides, setCurrentSlide, markDirty]
  )

  const handleMoveSlideLeft = useCallback(
    (index: number) => {
      if (index > 0) {
        pushState(slides)
        reorderSlides(index, index - 1)
        setCurrentSlide(index - 1)
        markDirty()
      }
    },
    [slides, pushState, reorderSlides, setCurrentSlide, markDirty]
  )

  const handleMoveSlideRight = useCallback(
    (index: number) => {
      if (index < slides.length - 1) {
        pushState(slides)
        reorderSlides(index, index + 1)
        setCurrentSlide(index + 1)
        markDirty()
      }
    },
    [slides, pushState, reorderSlides, setCurrentSlide, markDirty]
  )

  const handleAddSlide = useCallback(() => {
    pushState(slides)
    addSlide()
    markDirty()
  }, [slides, pushState, addSlide, markDirty])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        editingTextId
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey

      // Zoom shortcuts
      if (ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        setZoom(Math.min(3, zoom * 1.2))
        return
      }
      if (ctrlKey && e.key === '-') {
        e.preventDefault()
        setZoom(Math.max(0.1, zoom / 1.2))
        return
      }
      if (ctrlKey && e.key === '0') {
        e.preventDefault()
        setZoom(1)
        return
      }

      // Delete elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          pushState(slides)
          deleteElements(selectedIds)
          clearSelection()
          markDirty()
        }
        return
      }

      // Select all: Ctrl/Cmd + A
      if (ctrlKey && e.key === 'a') {
        e.preventDefault()
        const slide = getCurrentSlide()
        if (slide) {
          selectMultiple(slide.elements.map((el) => el.id))
        }
        return
      }

      // Undo: Ctrl/Cmd + Z
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const currentSlides = useSlidesStore.getState().slides
        const previousState = useHistoryStore.getState().undo(currentSlides)
        if (previousState) {
          useSlidesStore.getState().setSlides(previousState)
        }
        return
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        const currentSlides = useSlidesStore.getState().slides
        const nextState = useHistoryStore.getState().redo(currentSlides)
        if (nextState) {
          useSlidesStore.getState().setSlides(nextState)
        }
        return
      }

      // Save: Ctrl/Cmd + S
      if (ctrlKey && e.key === 's') {
        e.preventDefault()
        const { format } = useCanvasStore.getState()
        const { slides: currentSlides } = useSlidesStore.getState()
        saveProject(format, currentSlides)
        return
      }

      // Arrow keys for nudging
      if (
        selectedIds.length > 0 &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const updates = selectedIds
          .map((id) => {
            const element = currentSlide?.elements.find((el) => el.id === id)
            if (!element) return null

            let { x, y } = element
            switch (e.key) {
              case 'ArrowUp':
                y -= step
                break
              case 'ArrowDown':
                y += step
                break
              case 'ArrowLeft':
                x -= step
                break
              case 'ArrowRight':
                x += step
                break
            }
            return { id, changes: { x, y } }
          })
          .filter((u): u is { id: string; changes: { x: number; y: number } } => u !== null)

        if (updates.length > 0) {
          pushState(slides)
          updateElements(updates)
          markDirty()
        }
      }

      // Navigate slides with Page Up/Down
      if (e.key === 'PageDown' || (e.key === 'ArrowRight' && e.altKey)) {
        e.preventDefault()
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlide(currentSlideIndex + 1)
        }
        return
      }
      if (e.key === 'PageUp' || (e.key === 'ArrowLeft' && e.altKey)) {
        e.preventDefault()
        if (currentSlideIndex > 0) {
          setCurrentSlide(currentSlideIndex - 1)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedIds,
    slides,
    currentSlide,
    currentSlideIndex,
    editingTextId,
    zoom,
    setZoom,
    pushState,
    deleteElements,
    clearSelection,
    selectMultiple,
    updateElements,
    getCurrentSlide,
    markDirty,
    saveProject,
    setCurrentSlide,
  ])

  // Wheel handler for zoom and pan
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey

      if (ctrlKey) {
        // Zoom towards mouse position
        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(0.1, Math.min(3, zoom * delta))

        // Adjust pan to zoom towards mouse
        const zoomRatio = newZoom / zoom
        const newPanX = mouseX - (mouseX - panX) * zoomRatio
        const newPanY = mouseY - (mouseY - panY) * zoomRatio

        setZoom(newZoom)
        setPanX(newPanX)
        setPanY(newPanY)
      } else {
        // Pan with wheel
        setPanX((prev) => prev - e.deltaX)
        setPanY((prev) => prev - e.deltaY)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [zoom, setZoom, panX, panY])

  // Space + drag panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !editingTextId) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
        setIsPanning(false)
        panStartRef.current = null
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [editingTextId])

  // Mouse handlers for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Space + left click or middle mouse button
      if ((isSpacePressed && e.button === 0) || e.button === 1) {
        e.preventDefault()
        setIsPanning(true)
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX,
          panY,
        }
      }
    },
    [isSpacePressed, panX, panY]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !panStartRef.current) return
      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      setPanX(panStartRef.current.panX + dx)
      setPanY(panStartRef.current.panY + dy)
    },
    [isPanning]
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    panStartRef.current = null
  }, [])

  // Z-order and context menu callbacks
  const bringToFront = useCallback(() => {
    const id = selectedIds[0]
    if (selectedIds.length === 1 && id) {
      pushState(slides)
      useSlidesStore.getState().bringToFront(id)
      markDirty()
    }
  }, [selectedIds, slides, pushState, markDirty])

  const sendToBack = useCallback(() => {
    const id = selectedIds[0]
    if (selectedIds.length === 1 && id) {
      pushState(slides)
      useSlidesStore.getState().sendToBack(id)
      markDirty()
    }
  }, [selectedIds, slides, pushState, markDirty])

  const bringForward = useCallback(() => {
    const id = selectedIds[0]
    if (selectedIds.length === 1 && id) {
      pushState(slides)
      useSlidesStore.getState().bringForward(id)
      markDirty()
    }
  }, [selectedIds, slides, pushState, markDirty])

  const sendBackward = useCallback(() => {
    const id = selectedIds[0]
    if (selectedIds.length === 1 && id) {
      pushState(slides)
      useSlidesStore.getState().sendBackward(id)
      markDirty()
    }
  }, [selectedIds, slides, pushState, markDirty])

  const deleteSelected = useCallback(() => {
    if (selectedIds.length > 0) {
      pushState(slides)
      deleteElements(selectedIds)
      clearSelection()
      markDirty()
    }
  }, [selectedIds, slides, pushState, deleteElements, clearSelection, markDirty])

  const undo = useCallback(() => {
    const currentSlides = useSlidesStore.getState().slides
    const previousState = useHistoryStore.getState().undo(currentSlides)
    if (previousState) {
      useSlidesStore.getState().setSlides(previousState)
    }
  }, [])

  const redo = useCallback(() => {
    const currentSlides = useSlidesStore.getState().slides
    const nextState = useHistoryStore.getState().redo(currentSlides)
    if (nextState) {
      useSlidesStore.getState().setSlides(nextState)
    }
  }, [])

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          className={`relative h-full w-full overflow-hidden bg-gray-100 ${
            isSpacePressed ? 'cursor-grab' : ''
          } ${isPanning ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Infinite canvas content - transformed with zoom */}
          <div
            className="absolute"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Slides laid out horizontally */}
            <div className="flex items-start gap-0" style={{ paddingTop: TOOLBAR_HEIGHT + 10 }}>
              {slides.map((slide, slideIndex) => {
                const isCurrentSlide = slideIndex === currentSlideIndex
                const stageRef = stageRefs.current.get(slideIndex)

                return (
                  <div
                    key={slide.id}
                    className="relative flex-shrink-0"
                    style={{
                      marginRight: slideIndex < slides.length - 1 ? SLIDE_GAP : 0,
                    }}
                  >
                    {/* Per-slide toolbar */}
                    <SlideToolbar
                      slideIndex={slideIndex}
                      totalSlides={slides.length}
                      onDelete={() => handleDeleteSlide(slideIndex)}
                      onDuplicate={() => handleDuplicateSlide(slideIndex)}
                      onAddBlank={() => handleAddBlankAfter(slideIndex)}
                      onMoveLeft={() => handleMoveSlideLeft(slideIndex)}
                      onMoveRight={() => handleMoveSlideRight(slideIndex)}
                    />

                    {/* Slide canvas */}
                    <div
                      className={`relative bg-white shadow-lg transition-shadow ${
                        isCurrentSlide ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        if (!isCurrentSlide) {
                          setCurrentSlide(slideIndex)
                        }
                      }}
                    >
                      <Stage
                        ref={(ref) => {
                          if (ref) {
                            stageRefs.current.set(slideIndex, ref)
                          }
                        }}
                        width={scaledWidth}
                        height={scaledHeight}
                        scaleX={DISPLAY_SCALE_FACTOR}
                        scaleY={DISPLAY_SCALE_FACTOR}
                        onClick={(e) => handleStageClick(slideIndex, e)}
                        onMouseDown={(e) => handleStageMouseDown(slideIndex, e)}
                        onMouseMove={() => handleStageMouseMove(slideIndex)}
                        onMouseUp={() => handleStageMouseUp(slideIndex)}
                        onMouseLeave={() => handleStageMouseUp(slideIndex)}
                      >
                        {/* Background Layer */}
                        <Layer>
                          <Rect
                            x={0}
                            y={0}
                            width={width}
                            height={height}
                            fill={slide.backgroundColor || '#ffffff'}
                            listening={false}
                          />
                        </Layer>

                        {/* Elements Layer */}
                        <Layer>
                          {slide.elements.map((element) => (
                            <ElementRenderer
                              key={element.id}
                              element={element}
                              isSelected={isCurrentSlide && selectedIds.includes(element.id)}
                              onSelect={handleSelect}
                              onDragStart={handleDragStart}
                              onDragMove={handleDragMove}
                              onDragEnd={handleDragEnd}
                              onTransformEnd={(id, updates) =>
                                handleTransformEnd([
                                  {
                                    id,
                                    x: updates.x ?? element.x,
                                    y: updates.y ?? element.y,
                                    width: updates.width ?? element.width,
                                    height: updates.height ?? element.height,
                                    rotation: updates.rotation ?? element.rotation,
                                  },
                                ])
                              }
                            />
                          ))}

                          {/* Snap Lines - only for current slide */}
                          {isCurrentSlide && <SnapLines stageWidth={width} stageHeight={height} />}

                          {/* Selection Rectangle - only for current slide */}
                          {isCurrentSlide && <SelectionRect />}

                          {/* Transformer - only for current slide */}
                          {isCurrentSlide && (
                            <SelectionTransformer
                              stageRef={{ current: stageRef ?? null }}
                              selectedIds={selectedIds}
                              elements={slide.elements}
                              onTransformEnd={handleTransformEnd}
                            />
                          )}
                        </Layer>
                      </Stage>

                      {/* Text Editing Overlay - only for current slide */}
                      {isCurrentSlide && (
                        <TextOverlay
                          stageRef={{ current: stageRef ?? null } as React.RefObject<Konva.Stage>}
                        />
                      )}
                    </div>

                    {/* Slide number */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-400">
                      {slideIndex + 1}
                    </div>
                  </div>
                )
              })}

              {/* Add slide button */}
              <button
                onClick={handleAddSlide}
                className="flex flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-500"
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  marginLeft: slides.length > 0 ? SLIDE_GAP : 0,
                }}
              >
                <Plus className="h-12 w-12" />
              </button>
            </div>
          </div>

          {/* Zoom Controls - fixed position */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-lg border bg-white px-2 py-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomOut}
              title="Zoom out (Cmd+-)"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <button
              onClick={resetZoom}
              className="min-w-[60px] rounded px-2 py-1 text-sm font-medium hover:bg-gray-100"
              title="Reset zoom (Cmd+0)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomIn}
              title="Zoom in (Cmd++)"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        {selectedIds.length > 0 ? (
          <>
            <ContextMenuItem onClick={bringToFront}>
              Bring to Front
              <ContextMenuShortcut>Shift+Up</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={bringForward}>
              Bring Forward
              <ContextMenuShortcut>Up</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={sendBackward}>
              Send Backward
              <ContextMenuShortcut>Down</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={sendToBack}>
              Send to Back
              <ContextMenuShortcut>Shift+Down</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={deleteSelected} className="text-red-600">
              Delete
              <ContextMenuShortcut>Delete</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={undo} disabled={!useHistoryStore.getState().canUndo()}>
              Undo
              <ContextMenuShortcut>Cmd+Z</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={redo} disabled={!useHistoryStore.getState().canRedo()}>
              Redo
              <ContextMenuShortcut>Cmd+Y</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
