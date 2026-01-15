'use client'

import type Konva from 'konva'
import { useCallback, useEffect, useRef } from 'react'
import { DISPLAY_SCALE_FACTOR, useCanvasStore } from '@/stores/canvas-store'
import { useSelectionStore } from '@/stores/selection-store'
import { type TextElement, useSlidesStore } from '@/stores/slides-store'

interface TextOverlayProps {
  stageRef: React.RefObject<Konva.Stage | null>
}

export function TextOverlay({ stageRef }: TextOverlayProps) {
  const { editingTextId, setEditingTextId } = useSelectionStore()
  const { getElementById, updateElement } = useSlidesStore()
  const { zoom } = useCanvasStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const element = editingTextId ? (getElementById(editingTextId) as TextElement | undefined) : null

  const handleBlur = useCallback(() => {
    if (editingTextId && textareaRef.current) {
      updateElement(editingTextId, { text: textareaRef.current.value })
      setEditingTextId(null)
    }
  }, [editingTextId, setEditingTextId, updateElement])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBlur()
      }
    },
    [handleBlur]
  )

  // Focus the textarea when editing starts
  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [editingTextId])

  if (!editingTextId || !element || element.type !== 'text') {
    return null
  }

  const stage = stageRef.current
  if (!stage) return null

  // Get the stage container's position
  const container = stage.container()
  const containerRect = container.getBoundingClientRect()

  // Calculate scale (same as Stage uses)
  const scale = DISPLAY_SCALE_FACTOR * zoom

  // Calculate position relative to the stage
  const x = element.x * scale + containerRect.left
  const y = element.y * scale + containerRect.top

  return (
    <textarea
      ref={textareaRef}
      defaultValue={element.text}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width: element.width * scale,
        minHeight: element.height * scale,
        fontSize: element.fontSize * scale,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textAlign: element.textAlign,
        color: element.fill,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'top left',
        border: '2px solid #0066ff',
        outline: 'none',
        background: 'transparent',
        resize: 'none',
        overflow: 'hidden',
        padding: 0,
        margin: 0,
        lineHeight: 1.2,
        zIndex: 1000,
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  )
}
