'use client'

import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useCallback, useEffect, useRef } from 'react'
import { Layer, Rect, Stage } from 'react-konva'

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
  const { setStageRef, getDimensions, snapEnabled, setGuidelines, clearGuidelines, zoom } =
    useCanvasStore()
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedIds,
    slides,
    currentSlide,
    editingTextId,
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

  const scaledWidth = width * DISPLAY_SCALE_FACTOR
  const scaledHeight = height * DISPLAY_SCALE_FACTOR

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-8"
        >
          <div className="relative rounded-lg bg-white shadow-lg">
            <Stage
              ref={stageRef}
              width={scaledWidth}
              height={scaledHeight}
              scaleX={DISPLAY_SCALE_FACTOR}
              scaleY={DISPLAY_SCALE_FACTOR}
              onClick={handleStageClick}
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onMouseLeave={handleStageMouseUp}
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
