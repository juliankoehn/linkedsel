'use client'

import * as fabric from 'fabric'
import {
  Bold,
  Check,
  Circle,
  Download,
  Image as ImageIcon,
  Italic,
  Loader2,
  Minus,
  Palette,
  Pencil,
  Plus,
  Redo,
  Save,
  Sparkles,
  Square,
  Trash2,
  Type,
  Undo,
} from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useExport } from '@/hooks/use-export'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { FORMAT_PRESETS, type FormatPreset, useEditorStore } from '@/stores/editor'

interface EditorToolbarProps {
  onOpenAIPanel?: () => void
}

export function EditorToolbar({ onOpenAIPanel }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const { toast } = useToast()
  const { exportPDF } = useExport()
  const {
    addText,
    addShape,
    addImage,
    undo,
    redo,
    deleteSelected,
    selectedObject,
    updateSelectedObject,
    setBackgroundColor,
    canvas,
    history,
    projectName,
    setProjectName,
    saveProject,
    isSaving,
    isDirty,
    format,
    setFormat,
  } = useEditorStore()

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await addImage(file)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    const result = await saveProject()
    if ('error' in result) {
      toast({
        title: 'Fehler beim Speichern',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Gespeichert',
        description: 'Dein Projekt wurde erfolgreich gespeichert.',
      })
    }
  }

  const handleNameEdit = () => {
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  const handleNameSubmit = () => {
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
    }
  }

  const isTextObject = selectedObject instanceof fabric.IText
  const fill = (selectedObject?.fill as string) || '#000000'
  const fontSize = isTextObject ? (selectedObject as fabric.IText).fontSize || 48 : 48
  const fontWeight = isTextObject ? (selectedObject as fabric.IText).fontWeight : 'normal'
  const fontStyle = isTextObject ? (selectedObject as fabric.IText).fontStyle : 'normal'

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
    <div className="flex flex-col border-b">
      {/* Top row: Project name and save */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                ref={nameInputRef}
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="rounded border px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNameSubmit}>
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={handleNameEdit}
              className="flex items-center gap-1 rounded px-2 py-1 text-sm font-medium hover:bg-gray-100"
            >
              {projectName}
              <Pencil className="h-3 w-3 text-gray-400" />
            </button>
          )}
          {isDirty && <span className="text-xs text-gray-400">Ungespeichert</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* Format selector */}
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as FormatPreset)}
            className="rounded border px-2 py-1.5 text-sm"
          >
            {Object.entries(FORMAT_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.name} ({preset.ratio})
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>

          {onOpenAIPanel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAIPanel}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Content
            </Button>
          )}

          <Button onClick={exportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Bottom row: Tools */}
      <div className="flex items-center justify-between px-4 py-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => addText()} title="Text hinzufügen">
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleImageUpload} title="Bild hochladen">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('rect')} title="Rechteck">
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('circle')} title="Kreis">
            <Circle className="h-4 w-4" />
          </Button>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-1" title="Hintergrundfarbe">
            <Palette className="text-muted-foreground h-4 w-4" />
            <input
              type="color"
              value={(canvas?.backgroundColor as string) || '#ffffff'}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-gray-200 p-0.5"
            />
          </div>

          {selectedObject && (
            <>
              <div className="mx-2 h-6 w-px bg-gray-200" />

              <div className="flex items-center gap-1" title="Füllfarbe">
                <span className="text-muted-foreground text-xs">Farbe:</span>
                <input
                  type="color"
                  value={fill}
                  onChange={(e) => handleFillChange(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-gray-200 p-0.5"
                />
              </div>

              {isTextObject && (
                <>
                  <div className="mx-2 h-6 w-px bg-gray-200" />

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

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-7 w-7', fontWeight === 'bold' && 'bg-accent')}
                    onClick={toggleBold}
                    title="Fett"
                  >
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-7 w-7', fontStyle === 'italic' && 'bg-accent')}
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

          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            title="Rückgängig (Strg+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            title="Wiederherstellen (Strg+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={deleteSelected} title="Löschen (Entf)">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
