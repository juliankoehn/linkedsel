'use client'

import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Download,
  Undo,
  Redo,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores/editor'

export function EditorToolbar() {
  const { addText, addShape, undo, redo, deleteSelected, exportPDF } =
    useEditorStore()

  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => addText()}>
          <Type className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addShape('rect')}>
          <Square className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addShape('circle')}>
          <Circle className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-gray-200" />

        <Button variant="ghost" size="icon" onClick={undo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={deleteSelected}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={exportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
    </div>
  )
}
