'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { Group, Rect } from 'react-konva'

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
    >
      {/* Frame background */}
      <Rect
        width={element.width}
        height={element.height}
        fill={element.fill || 'transparent'}
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

      {/* Render children */}
      {element.children.map((child) => (
        <ElementRenderer
          key={child.id}
          element={child}
          isSelected={false}
          onSelect={onSelect}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd as (id: string, updates: Partial<CanvasElement>) => void}
        />
      ))}
    </Group>
  )
}
