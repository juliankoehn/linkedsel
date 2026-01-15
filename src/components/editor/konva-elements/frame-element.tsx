'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { useMemo } from 'react'
import { Group, Rect } from 'react-konva'

import { calculateFrameAutoSize, calculateFrameLayout } from '@/lib/yoga-layout'
import type { CanvasElement, FrameElement as FrameElementType } from '@/stores/slides-store'

import { ElementRenderer } from './index'

interface FrameElementProps {
  element: FrameElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<FrameElementType>) => void
}

export function FrameElement({
  element,
  isSelected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: FrameElementProps) {
  // Calculate auto-size if enabled
  const autoSize = useMemo(() => calculateFrameAutoSize(element), [element])

  // Use auto-calculated size or original size
  const frameWidth = autoSize?.width ?? element.width
  const frameHeight = autoSize?.height ?? element.height

  // Create frame with potentially auto-sized dimensions for layout calculation
  const frameForLayout = useMemo(
    () => ({
      ...element,
      width: frameWidth,
      height: frameHeight,
    }),
    [element, frameWidth, frameHeight]
  )

  // Calculate layout positions for children using Yoga WASM engine
  const layoutResults = useMemo(() => calculateFrameLayout(frameForLayout), [frameForLayout])

  // Create a map for quick lookup
  const layoutMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number; width: number; height: number }>()
    layoutResults.forEach((result) => {
      map.set(result.id, {
        x: result.x,
        y: result.y,
        width: result.width,
        height: result.height,
      })
    })
    return map
  }, [layoutResults])

  // Check if auto-layout is active (children should not be individually draggable)
  const hasAutoLayout = element.layoutMode !== 'none'

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={frameWidth}
      height={frameHeight}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={(e) => onSelect(element.id, e)}
      onTap={(e) => onSelect(element.id, e as unknown as KonvaEventObject<MouseEvent>)}
      onDragStart={() => onDragStart(element.id)}
      onDragMove={(e) => {
        const node = e.target
        onDragMove(element.id, node.x(), node.y())
      }}
      onDragEnd={() => onDragEnd(element.id)}
      // Clip children to frame bounds
      clipFunc={(ctx) => {
        ctx.rect(0, 0, frameWidth, frameHeight)
      }}
    >
      {/* Frame background */}
      <Rect
        width={frameWidth}
        height={frameHeight}
        fill={element.fill || undefined}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
        cornerRadius={element.cornerRadius || 0}
      />

      {/* Frame border when selected (dashed) */}
      {isSelected && (
        <Rect
          width={frameWidth}
          height={frameHeight}
          stroke="#0066ff"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}

      {/* Render children with Yoga-calculated layout positions */}
      {element.children.map((child) => {
        const layout = layoutMap.get(child.id)

        // Override child position with Yoga-calculated position
        // Also lock children in auto-layout mode to prevent individual dragging
        const positionedChild =
          hasAutoLayout && layout ? { ...child, x: layout.x, y: layout.y, locked: true } : child

        return (
          <ElementRenderer
            key={child.id}
            element={positionedChild}
            isSelected={false}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd as (id: string, updates: Partial<CanvasElement>) => void}
          />
        )
      })}
    </Group>
  )
}
