'use client'

import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { Minus, Plus } from 'lucide-react'
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

export function KonvaCanvas() {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)

  // Stores
  const {
    setStageRef,
    getDimensions,
    snapEnabled,
    setGuidelines,
    clearGuidelines,
    zoom,
    setZoom,
    pan,
    setPan,
  } = useCanvasStore()

  // Pan state
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const {
    slides,
    currentSlideIndex,
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

  // Set stage ref in store
  useEffect(() => {
    if (stageRef.current) {
      setStageRef(stageRef as React.RefObject<Konva.Stage | null>)
    }
  }, [setStageRef])

  // Handle element selection
  const handleSelect = useCallback(
    (id: string, e: KonvaEventObject<MouseEvent>) => {
      // Multi-select with Shift
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
      // Save history before drag
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

  // Handle stage click (deselect)
  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      // If clicked on empty area
      if (e.target === e.target.getStage()) {
        clearSelection()
      }
    },
    [clearSelection]
  )

  // Handle stage mouse down (start selection rect)
  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) return

      const stage = stageRef.current
      if (!stage) return

      const pos = stage.getPointerPosition()
      if (!pos) return

      // Adjust for zoom
      const adjustedPos = {
        x: pos.x / zoom,
        y: pos.y / zoom,
      }

      selectionStartRef.current = adjustedPos
      setIsMultiSelecting(true)
      setSelectionRect({ x: adjustedPos.x, y: adjustedPos.y, width: 0, height: 0 })
    },
    [zoom, setIsMultiSelecting, setSelectionRect]
  )

  // Handle stage mouse move (update selection rect)
  const handleStageMouseMove = useCallback(() => {
    if (!selectionStartRef.current) return

    const stage = stageRef.current
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
  }, [zoom, setSelectionRect])

  // Handle stage mouse up (finish selection rect)
  const handleStageMouseUp = useCallback(() => {
    if (!selectionStartRef.current || !currentSlide) {
      setIsMultiSelecting(false)
      setSelectionRect(null)
      selectionStartRef.current = null
      return
    }

    const stage = stageRef.current
    if (!stage) return

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

    // Only select if dragged a meaningful distance
    if (rect.width > 5 && rect.height > 5) {
      const ids = getElementsInRect(currentSlide.elements, rect)
      if (ids.length > 0) {
        selectMultiple(ids)
      }
    }

    setIsMultiSelecting(false)
    setSelectionRect(null)
    selectionStartRef.current = null
  }, [currentSlide, zoom, selectMultiple, setIsMultiSelecting, setSelectionRect])

  // Zoom with wheel
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey

      if (ctrlKey) {
        // Zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(0.1, Math.min(3, zoom * delta))
        setZoom(newZoom)
      } else {
        // Pan
        setPan({
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        })
      }
    },
    [zoom, pan, setZoom, setPan]
  )

  // Attach wheel handler
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Pan handlers
  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      if (isSpacePressed || e.button === 1) {
        e.preventDefault()
        setIsPanning(true)
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX: pan.x,
          panY: pan.y,
        }
      }
    },
    [isSpacePressed, pan]
  )

  const handlePanMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !panStartRef.current) return
      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      })
    },
    [isPanning, setPan]
  )

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
    panStartRef.current = null
  }, [])

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(Math.min(3, zoom * 1.2))
  }, [zoom, setZoom])

  const zoomOut = useCallback(() => {
    setZoom(Math.max(0.1, zoom / 1.2))
  }, [zoom, setZoom])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [setZoom, setPan])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space for panning
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setIsSpacePressed(true)
        return
      }

      // Don't handle when typing in inputs
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
        setPan({ x: 0, y: 0 })
        return
      }

      // Delete
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
        const previousState = useHistoryStore.getState().undo()
        if (previousState) {
          useSlidesStore.getState().setSlides(previousState)
        }
        return
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        const nextState = useHistoryStore.getState().redo()
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
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    selectedIds,
    slides,
    currentSlide,
    editingTextId,
    zoom,
    setZoom,
    setPan,
    pushState,
    deleteElements,
    clearSelection,
    selectMultiple,
    updateElements,
    getCurrentSlide,
    markDirty,
    saveProject,
  ])

  // Z-order functions
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
    const previousState = useHistoryStore.getState().undo()
    if (previousState) {
      useSlidesStore.getState().setSlides(previousState)
    }
  }, [])

  const redo = useCallback(() => {
    const nextState = useHistoryStore.getState().redo()
    if (nextState) {
      useSlidesStore.getState().setSlides(nextState)
    }
  }, [])

  const scaledWidth = width * DISPLAY_SCALE_FACTOR * zoom
  const scaledHeight = height * DISPLAY_SCALE_FACTOR * zoom

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gray-100 ${
            isSpacePressed || isPanning ? 'cursor-grab' : ''
          } ${isPanning ? 'cursor-grabbing' : ''}`}
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
        >
          {/* Canvas with zoom/pan transform */}
          <div
            className="relative rounded-lg bg-white shadow-lg"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            <Stage
              ref={stageRef}
              width={scaledWidth}
              height={scaledHeight}
              scaleX={DISPLAY_SCALE_FACTOR * zoom}
              scaleY={DISPLAY_SCALE_FACTOR * zoom}
              onClick={handleStageClick}
              onMouseDown={isPanning ? undefined : handleStageMouseDown}
              onMouseMove={isPanning ? undefined : handleStageMouseMove}
              onMouseUp={isPanning ? undefined : handleStageMouseUp}
              onMouseLeave={isPanning ? undefined : handleStageMouseUp}
            >
              {/* Background Layer */}
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  fill={currentSlide?.backgroundColor || '#ffffff'}
                  listening={false}
                />
              </Layer>

              {/* Elements Layer */}
              <Layer>
                {currentSlide?.elements.map((element) => (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    isSelected={selectedIds.includes(element.id)}
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

                {/* Snap Lines */}
                <SnapLines stageWidth={width} stageHeight={height} />

                {/* Selection Rectangle */}
                <SelectionRect />

                {/* Transformer */}
                <SelectionTransformer
                  stageRef={stageRef}
                  selectedIds={selectedIds}
                  onTransformEnd={handleTransformEnd}
                />
              </Layer>
            </Stage>

            {/* Text Editing Overlay */}
            <TextOverlay stageRef={stageRef} />
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-white px-2 py-1 shadow-sm">
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
