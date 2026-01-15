'use client'

import type { KonvaEventObject } from 'konva/lib/Node'

import type { CanvasElement } from '@/stores/slides-store'

import { ImageElement } from './image-element'
import { CircleElement, RectElement } from './shape-element'
import { TextElement } from './text-element'

interface ElementRendererProps {
  element: CanvasElement
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<CanvasElement>) => void
}

export function ElementRenderer({
  element,
  isSelected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: ElementRendererProps) {
  const commonProps = {
    isSelected,
    onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTransformEnd,
  }

  switch (element.type) {
    case 'text':
      return <TextElement element={element} {...commonProps} />
    case 'image':
      return <ImageElement element={element} {...commonProps} />
    case 'rect':
      return <RectElement element={element} {...commonProps} />
    case 'circle':
      return <CircleElement element={element} {...commonProps} />
    case 'group':
      // TODO: Implement group rendering
      return null
    case 'line':
      // TODO: Implement line rendering
      return null
    default:
      return null
  }
}

export { ImageElement } from './image-element'
export { CircleElement, RectElement } from './shape-element'
export { TextElement } from './text-element'
