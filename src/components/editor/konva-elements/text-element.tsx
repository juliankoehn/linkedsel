'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { Text } from 'react-konva'

import { useSelectionStore } from '@/stores/selection-store'
import type { TextElement as TextElementType } from '@/stores/slides-store'

interface TextElementProps {
  element: TextElementType
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<TextElementType>) => void
}

export function TextElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TextElementProps) {
  const { editingTextId, setEditingTextId } = useSelectionStore()
  const isEditing = editingTextId === element.id

  // Don't render Konva Text if we're editing (HTML overlay takes over)
  if (isEditing) {
    return null
  }

  // Build shadow config if enabled
  const shadowConfig = element.shadow?.enabled
    ? {
        shadowColor: element.shadow.color,
        shadowBlur: element.shadow.blur,
        shadowOffsetX: element.shadow.offsetX,
        shadowOffsetY: element.shadow.offsetY,
        shadowEnabled: true,
      }
    : {}

  return (
    <Text
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      text={element.text}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      fontStyle={`${element.fontWeight} ${element.fontStyle}`}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      align={element.textAlign}
      opacity={element.opacity}
      rotation={element.rotation}
      visible={element.visible}
      draggable={!element.locked}
      textDecoration={element.textDecoration || 'none'}
      lineHeight={element.lineHeight || 1.2}
      letterSpacing={element.letterSpacing || 0}
      {...shadowConfig}
      onClick={(e) => onSelect(element.id, e)}
      onTap={(e) => onSelect(element.id, e as unknown as KonvaEventObject<MouseEvent>)}
      onDblClick={() => {
        // Enter text editing mode
        setEditingTextId(element.id)
      }}
      onDblTap={() => {
        setEditingTextId(element.id)
      }}
      onDragStart={() => onDragStart(element.id)}
      onDragMove={(e) => {
        const node = e.target
        onDragMove(element.id, node.x(), node.y())
      }}
      onDragEnd={() => onDragEnd(element.id)}
    />
  )
}
