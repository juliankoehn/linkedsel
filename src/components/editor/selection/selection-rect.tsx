'use client'

import { Rect } from 'react-konva'

import { useSelectionStore } from '@/stores/selection-store'

export function SelectionRect() {
  const { selectionRect, isMultiSelecting } = useSelectionStore()

  if (!isMultiSelecting || !selectionRect) return null

  return (
    <Rect
      x={selectionRect.x}
      y={selectionRect.y}
      width={selectionRect.width}
      height={selectionRect.height}
      fill="rgba(0, 102, 255, 0.1)"
      stroke="#0066ff"
      strokeWidth={1}
      listening={false}
    />
  )
}
