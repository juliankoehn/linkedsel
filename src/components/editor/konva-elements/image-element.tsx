'use client'

import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useEffect, useRef } from 'react'
import { Image as KonvaImage, Rect } from 'react-konva'
import { useImage } from 'react-konva-utils'

import type { ImageElement as ImageElementType } from '@/stores/slides-store'

interface ImageElementProps {
  element: ImageElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<ImageElementType>) => void
}

export function ImageElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ImageElementProps) {
  const [image, status] = useImage(element.src, 'anonymous')
  const imageRef = useRef<Konva.Image>(null)

  // Apply filters when they change
  useEffect(() => {
    const node = imageRef.current
    if (node && image && element.filters && element.filters.length > 0) {
      // Cache the node to enable filters
      node.cache()
    }
  }, [image, element.filters])

  // Show placeholder while loading
  if (status === 'loading') {
    return (
      <Rect
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        fill="#f0f0f0"
        stroke="#e0e0e0"
        strokeWidth={1}
        opacity={element.opacity}
        rotation={element.rotation}
        visible={element.visible}
      />
    )
  }

  // Show error placeholder
  if (status === 'failed') {
    return (
      <Rect
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        fill="#fee2e2"
        stroke="#ef4444"
        strokeWidth={1}
        opacity={element.opacity}
        rotation={element.rotation}
        visible={element.visible}
        draggable={!element.locked}
        onClick={(e) => onSelect(element.id, e)}
      />
    )
  }

  return (
    <KonvaImage
      ref={imageRef}
      id={element.id}
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
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
