'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { Arrow, Line } from 'react-konva'

import type {
  ArrowElement as ArrowElementType,
  LineElement as LineElementType,
} from '@/stores/slides-store'

interface LineElementProps {
  element: LineElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<LineElementType>) => void
}

export function LineElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: LineElementProps) {
  return (
    <Line
      id={element.id}
      x={element.x}
      y={element.y}
      points={element.points}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      lineCap={element.lineCap || 'round'}
      dash={element.dash}
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

interface ArrowElementProps {
  element: ArrowElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<ArrowElementType>) => void
}

export function ArrowElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ArrowElementProps) {
  return (
    <Arrow
      id={element.id}
      x={element.x}
      y={element.y}
      points={element.points}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      fill={element.fill || element.stroke}
      pointerLength={element.pointerLength || 15}
      pointerWidth={element.pointerWidth || 15}
      pointerAtBeginning={element.pointerAtStart || false}
      pointerAtEnding={element.pointerAtEnd !== false}
      lineCap={element.lineCap || 'round'}
      dash={element.dash}
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
