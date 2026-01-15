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

  // Auto-resize textarea to fit content
  const autoResize = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])

  // Focus the textarea when editing starts and set initial size
  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
      // Delay to ensure styles are applied
      requestAnimationFrame(autoResize)
    }
  }, [editingTextId, autoResize])

  if (!editingTextId || !element || element.type !== 'text') {
    return null
  }

  if (!stageRef.current) return null

  // Calculate scale (same as Stage uses)
  const scale = DISPLAY_SCALE_FACTOR * zoom

  // Border width for offset calculation
  const borderWidth = 2

  // Position is relative to the canvas wrapper (parent div with position: relative)
  // Offset by border width so text aligns exactly
  const x = element.x * scale - borderWidth
  const y = element.y * scale - borderWidth

  // Use element's lineHeight or Konva's default (1)
  const lineHeight = element.lineHeight ?? 1

  return (
    <textarea
      ref={textareaRef}
      defaultValue={element.text}
      onChange={autoResize}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: element.width * scale + borderWidth * 2,
        minHeight: element.fontSize * scale * lineHeight,
        fontSize: element.fontSize * scale,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textAlign: element.textAlign,
        color: element.fill,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'top left',
        border: `${borderWidth}px solid #0066ff`,
        outline: 'none',
        background: 'rgba(255, 255, 255, 0.9)',
        resize: 'none',
        overflow: 'hidden',
        padding: 0,
        margin: 0,
        lineHeight: lineHeight,
        zIndex: 1000,
        boxSizing: 'border-box',
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  )
}
