'use client'

import * as fabric from 'fabric'
import {
  Bold,
  Circle,
  Download,
  Image as ImageIcon,
  Italic,
  Minus,
  Palette,
  Plus,
  Redo,
  Square,
  Trash2,
  Type,
  Undo,
} from 'lucide-react'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor'

export function EditorToolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    addText,
    addShape,
    addImage,
    undo,
    redo,
    deleteSelected,
    exportPDF,
    selectedObject,
    updateSelectedObject,
    setBackgroundColor,
    canvas,
    history,
  } = useEditorStore()

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await addImage(file)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  // Get properties from selected object
  const isTextObject = selectedObject instanceof fabric.IText
  const fill = (selectedObject?.fill as string) || '#000000'
  const fontSize = isTextObject
    ? (selectedObject as fabric.IText).fontSize || 48
    : 48
  const fontWeight = isTextObject
    ? (selectedObject as fabric.IText).fontWeight
    : 'normal'
  const fontStyle = isTextObject
    ? (selectedObject as fabric.IText).fontStyle
    : 'normal'

  const handleFillChange = (color: string) => {
    if (selectedObject) {
      updateSelectedObject({ fill: color })
    }
  }

  const handleFontSizeChange = (delta: number) => {
    if (isTextObject) {
      const newSize = Math.max(8, Math.min(200, fontSize + delta))
      updateSelectedObject({ fontSize: newSize })
    }
  }

  const toggleBold = () => {
    if (isTextObject) {
      updateSelectedObject({
        fontWeight: fontWeight === 'bold' ? 'normal' : 'bold',
      })
    }
  }

  const toggleItalic = () => {
    if (isTextObject) {
      updateSelectedObject({
        fontStyle: fontStyle === 'italic' ? 'normal' : 'italic',
      })
    }
  }

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-1">
        {/* Add elements */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addText()}
          title="Text hinzufügen"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImageUpload}
          title="Bild hochladen"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addShape('rect')}
          title="Rechteck"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addShape('circle')}
          title="Kreis"
        >
          <Circle className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-gray-200" />

        {/* Background color */}
        <div className="flex items-center gap-1" title="Hintergrundfarbe">
          <Palette className="text-muted-foreground h-4 w-4" />
          <input
            type="color"
            value={(canvas?.backgroundColor as string) || '#ffffff'}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border border-gray-200 p-0.5"
          />
        </div>

        {/* Selected object controls */}
        {selectedObject && (
          <>
            <div className="mx-2 h-6 w-px bg-gray-200" />

            {/* Fill color */}
            <div className="flex items-center gap-1" title="Füllfarbe">
              <span className="text-muted-foreground text-xs">Farbe:</span>
              <input
                type="color"
                value={fill}
                onChange={(e) => handleFillChange(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded border border-gray-200 p-0.5"
              />
            </div>

            {/* Text-specific controls */}
            {isTextObject && (
              <>
                <div className="mx-2 h-6 w-px bg-gray-200" />

                {/* Font size */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleFontSizeChange(-4)}
                    title="Schrift verkleinern"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{fontSize}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleFontSizeChange(4)}
                    title="Schrift vergrößern"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="mx-1 h-6 w-px bg-gray-200" />

                {/* Bold/Italic */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7',
                    fontWeight === 'bold' && 'bg-accent'
                  )}
                  onClick={toggleBold}
                  title="Fett"
                >
                  <Bold className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7',
                    fontStyle === 'italic' && 'bg-accent'
                  )}
                  onClick={toggleItalic}
                  title="Kursiv"
                >
                  <Italic className="h-3 w-3" />
                </Button>
              </>
            )}
          </>
        )}

        <div className="mx-2 h-6 w-px bg-gray-200" />

        {/* Undo/Redo/Delete */}
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Rückgängig"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Wiederherstellen"
        >
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={deleteSelected}
          title="Löschen"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => exportPDF()}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
    </div>
  )
}
