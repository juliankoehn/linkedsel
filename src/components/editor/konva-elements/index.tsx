'use client'

import type { KonvaEventObject } from 'konva/lib/Node'

import type { CanvasElement } from '@/stores/slides-store'

import { FrameElement } from './frame-element'
import { GroupElement } from './group-element'
import { IconElement } from './icon-element'
import { ImageElement } from './image-element'
import { ArrowElement, LineElement } from './line-element'
import { PolygonElement, StarElement, TriangleElement } from './polygon-element'
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
    case 'line':
      return <LineElement element={element} {...commonProps} />
    case 'arrow':
      return <ArrowElement element={element} {...commonProps} />
    case 'triangle':
      return <TriangleElement element={element} {...commonProps} />
    case 'star':
      return <StarElement element={element} {...commonProps} />
    case 'polygon':
      return <PolygonElement element={element} {...commonProps} />
    case 'icon':
      return <IconElement element={element} {...commonProps} />
    case 'group':
      return <GroupElement element={element} {...commonProps} />
    case 'frame':
      return <FrameElement element={element} {...commonProps} />
    default:
      return null
  }
}

export { FrameElement } from './frame-element'
export { GroupElement } from './group-element'
export { IconElement } from './icon-element'
export { ImageElement } from './image-element'
export { ArrowElement, LineElement } from './line-element'
export { PolygonElement, StarElement, TriangleElement } from './polygon-element'
export { CircleElement, RectElement } from './shape-element'
export { TextElement } from './text-element'
