'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { RegularPolygon, Star } from 'react-konva'

import type {
  PolygonElement as PolygonElementType,
  StarElement as StarElementType,
  TriangleElement as TriangleElementType,
} from '@/stores/slides-store'

interface TriangleElementProps {
  element: TriangleElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<TriangleElementType>) => void
}

export function TriangleElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TriangleElementProps) {
  // RegularPolygon uses center as x,y, so adjust
  const radius = Math.min(element.width, element.height) / 2
  const centerX = element.x + element.width / 2
  const centerY = element.y + element.height / 2

  return (
    <RegularPolygon
      id={element.id}
      x={centerX}
      y={centerY}
      sides={3}
      radius={radius}
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
        onDragMove(element.id, node.x() - element.width / 2, node.y() - element.height / 2)
      }}
      onDragEnd={() => onDragEnd(element.id)}
    />
  )
}

interface StarElementProps {
  element: StarElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<StarElementType>) => void
}

export function StarElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: StarElementProps) {
  // Star uses center as x,y
  const centerX = element.x + element.width / 2
  const centerY = element.y + element.height / 2

  return (
    <Star
      id={element.id}
      x={centerX}
      y={centerY}
      numPoints={element.numPoints}
      innerRadius={element.innerRadius}
      outerRadius={element.outerRadius}
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
        onDragMove(element.id, node.x() - element.width / 2, node.y() - element.height / 2)
      }}
      onDragEnd={() => onDragEnd(element.id)}
    />
  )
}

interface PolygonElementProps {
  element: PolygonElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<PolygonElementType>) => void
}

export function PolygonElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: PolygonElementProps) {
  const radius = Math.min(element.width, element.height) / 2
  const centerX = element.x + element.width / 2
  const centerY = element.y + element.height / 2

  return (
    <RegularPolygon
      id={element.id}
      x={centerX}
      y={centerY}
      sides={element.sides}
      radius={radius}
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
        onDragMove(element.id, node.x() - element.width / 2, node.y() - element.height / 2)
      }}
      onDragEnd={() => onDragEnd(element.id)}
    />
  )
}
