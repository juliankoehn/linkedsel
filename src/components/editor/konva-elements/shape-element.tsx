'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { Circle, Rect } from 'react-konva'

import type {
  CircleElement as CircleElementType,
  RectElement as RectElementType,
} from '@/stores/slides-store'

interface RectElementProps {
  element: RectElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<RectElementType>) => void
}

export function RectElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: RectElementProps) {
  return (
    <Rect
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      cornerRadius={element.cornerRadius}
      opacity={element.opacity}
      rotation={element.rotation}
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
    />
  )
}

interface CircleElementProps {
  element: CircleElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<CircleElementType>) => void
}

export function CircleElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: CircleElementProps) {
  // Konva Circle uses x,y as center, so we need to adjust
  const centerX = element.x + element.radius
  const centerY = element.y + element.radius

  return (
    <Circle
      id={element.id}
      x={centerX}
      y={centerY}
      radius={element.radius}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      opacity={element.opacity}
      rotation={element.rotation}
      visible={element.visible}
      draggable={!element.locked}
      onClick={(e) => onSelect(element.id, e)}
      onTap={(e) => onSelect(element.id, e as unknown as KonvaEventObject<MouseEvent>)}
      onDragStart={() => onDragStart(element.id)}
      onDragMove={(e) => {
        const node = e.target
        // Convert center back to top-left
        onDragMove(element.id, node.x() - element.radius, node.y() - element.radius)
      }}
      onDragEnd={() => onDragEnd(element.id)}
    />
  )
}
