'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { Group, Rect } from 'react-konva'

import type { CanvasElement, GroupElement as GroupElementType } from '@/stores/slides-store'

import { ElementRenderer } from './index'

interface GroupElementProps {
  element: GroupElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<GroupElementType>) => void
}

export function GroupElement({
  element,
  isSelected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: GroupElementProps) {
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
      {/* Invisible rect for hit detection */}
      <Rect width={element.width} height={element.height} fill="transparent" />

      {/* Group border when selected (dashed) */}
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
