'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { useMemo } from 'react'
import { Group, Rect } from 'react-konva'

import { calculateFrameLayout } from '@/lib/yoga-layout'
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
  // Calculate layout positions for children using Yoga WASM engine
  const layoutResults = useMemo(() => calculateFrameLayout(element), [element])

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

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
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
        ctx.rect(0, 0, element.width, element.height)
      }}
    >
      {/* Frame background */}
      <Rect
        width={element.width}
        height={element.height}
        fill={element.fill || undefined}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
        cornerRadius={element.cornerRadius || 0}
      />

      {/* Frame border when selected (dashed) */}
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
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
        const positionedChild =
          element.layoutMode !== 'none' && layout ? { ...child, x: layout.x, y: layout.y } : child

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
