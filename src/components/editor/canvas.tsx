'use client'

import { useEffect, useRef } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useEditorStore } from '@/stores/editor'

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    initCanvas,
    undo,
    redo,
    deleteSelected,
    selectedObject,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    saveProject,
    canvas,
  } = useEditorStore()

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      initCanvas(canvasRef.current)
    }
  }, [initCanvas])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Check if we're editing text in fabric
      if (canvas) {
        const activeObj = canvas.getActiveObject()
        if (activeObj && 'isEditing' in activeObj && activeObj.isEditing) {
          return
        }
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey

      // Undo: Ctrl/Cmd + Z
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }

      // Save: Ctrl/Cmd + S
      if (ctrlKey && e.key === 's') {
        e.preventDefault()
        saveProject()
        return
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }

      // Arrow keys for moving objects
      if (selectedObject && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        let left = selectedObject.left || 0
        let top = selectedObject.top || 0

        switch (e.key) {
          case 'ArrowUp':
            top -= step
            break
          case 'ArrowDown':
            top += step
            break
          case 'ArrowLeft':
            left -= step
            break
          case 'ArrowRight':
            left += step
            break
        }

        selectedObject.set({ left, top })
        canvas?.renderAll()
        useEditorStore.getState().saveCurrentSlide()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteSelected, selectedObject, canvas, saveProject])

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-8"
        >
          <div className="rounded-lg bg-white shadow-lg">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {selectedObject ? (
          <>
            <ContextMenuItem onClick={bringToFront}>
              Nach ganz vorne
              <ContextMenuShortcut>⇧↑</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={bringForward}>
              Eine Ebene nach vorne
              <ContextMenuShortcut>↑</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={sendBackward}>
              Eine Ebene nach hinten
              <ContextMenuShortcut>↓</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={sendToBack}>
              Nach ganz hinten
              <ContextMenuShortcut>⇧↓</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={deleteSelected} className="text-red-600">
              Löschen
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem
              onClick={undo}
              disabled={useEditorStore.getState().history.past.length === 0}
            >
              Rückgängig
              <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={redo}
              disabled={useEditorStore.getState().history.future.length === 0}
            >
              Wiederherstellen
              <ContextMenuShortcut>⌘Y</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
