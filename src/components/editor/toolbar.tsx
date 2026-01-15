'use client'

import {
  Bold,
  Check,
  ChevronDown,
  Circle,
  Download,
  Hexagon,
  Image as ImageIcon,
  Italic,
  Loader2,
  Minus,
  MoveRight,
  Palette,
  Pencil,
  Pentagon,
  Plus,
  Redo,
  Save,
  Sparkles,
  Square,
  Star,
  Strikethrough,
  Trash2,
  Triangle,
  Type,
  Underline,
  Undo,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { ColorButton } from '@/components/editor/color-picker'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useExport } from '@/hooks/use-export'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { FORMAT_PRESETS, type FormatPreset, useCanvasStore } from '@/stores/canvas-store'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import {
  createArrowElement,
  createCircleElement,
  createImageElement,
  createLineElement,
  createPolygonElement,
  createRectElement,
  createStarElement,
  createTextElement,
  createTriangleElement,
  type TextElement,
  useSlidesStore,
} from '@/stores/slides-store'

interface EditorToolbarProps {
  onOpenAIPanel?: () => void
}

export function EditorToolbar({ onOpenAIPanel }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const { toast } = useToast()
  const { exportPDF } = useExport()

  // Stores
  const { format, setFormat, getDimensions } = useCanvasStore()
  const {
    slides,
    currentSlideIndex,
    addElement,
    updateElement,
    deleteElements,
    setSlideBackground,
  } = useSlidesStore()
  const { selectedIds, clearSelection } = useSelectionStore()
  const { pushState, canUndo, canRedo } = useHistoryStore()
  const { name, setName, saveProject, isSaving, isDirty } = useProjectStore()

  const currentSlide = slides[currentSlideIndex]
  const selectedElement =
    selectedIds.length === 1 ? currentSlide?.elements.find((el) => el.id === selectedIds[0]) : null

  const { width, height } = getDimensions()

  // Add text element
  const addText = () => {
    pushState(slides)
    const element = createTextElement({
      x: width / 2 - 150,
      y: height / 2 - 30,
      width: 300,
      text: 'Your text here',
    })
    addElement(element)
    useSelectionStore.getState().select(element.id)
    useProjectStore.getState().markDirty()
  }

  // Add shape element
  const addShape = (
    type: 'rect' | 'circle' | 'line' | 'arrow' | 'triangle' | 'star' | 'polygon',
    sides?: number
  ) => {
    pushState(slides)
    let element
    switch (type) {
      case 'rect':
        element = createRectElement({
          x: width / 2 - 100,
          y: height / 2 - 100,
          width: 200,
          height: 200,
        })
        break
      case 'circle':
        element = createCircleElement({
          x: width / 2 - 100,
          y: height / 2 - 100,
          width: 200,
          height: 200,
          radius: 100,
        })
        break
      case 'line':
        element = createLineElement({
          x: width / 2 - 100,
          y: height / 2,
          points: [0, 0, 200, 0],
        })
        break
      case 'arrow':
        element = createArrowElement({
          x: width / 2 - 100,
          y: height / 2,
          points: [0, 0, 200, 0],
        })
        break
      case 'triangle':
        element = createTriangleElement({
          x: width / 2 - 50,
          y: height / 2 - 50,
          width: 100,
          height: 100,
        })
        break
      case 'star':
        element = createStarElement({
          x: width / 2 - 50,
          y: height / 2 - 50,
          width: 100,
          height: 100,
        })
        break
      case 'polygon':
        element = createPolygonElement(sides || 6, {
          x: width / 2 - 50,
          y: height / 2 - 50,
          width: 100,
          height: 100,
        })
        break
      default:
        return
    }
    addElement(element)
    useSelectionStore.getState().select(element.id)
    useProjectStore.getState().markDirty()
  }

  // Add image
  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) {
          pushState(slides)
          const element = createImageElement(dataUrl, {
            x: width / 2 - 200,
            y: height / 2 - 150,
            width: 400,
            height: 300,
          })
          addElement(element)
          useSelectionStore.getState().select(element.id)
          useProjectStore.getState().markDirty()
        }
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  // Undo/Redo
  const undo = () => {
    const previousState = useHistoryStore.getState().undo()
    if (previousState) {
      useSlidesStore.getState().setSlides(previousState)
    }
  }

  const redo = () => {
    const nextState = useHistoryStore.getState().redo()
    if (nextState) {
      useSlidesStore.getState().setSlides(nextState)
    }
  }

  // Delete selected
  const deleteSelected = () => {
    if (selectedIds.length > 0) {
      pushState(slides)
      deleteElements(selectedIds)
      clearSelection()
      useProjectStore.getState().markDirty()
    }
  }

  // Save
  const handleSave = async () => {
    const result = await saveProject(format, slides)
    if ('error' in result) {
      toast({
        title: 'Error saving',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Saved',
        description: 'Your project has been saved successfully.',
      })
    }
  }

  // Name editing
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

  // Background color
  const handleBackgroundChange = (color: string) => {
    pushState(slides)
    setSlideBackground(currentSlideIndex, color)
    useProjectStore.getState().markDirty()
  }

  // Text formatting
  const isTextElement = selectedElement?.type === 'text'
  const textElement = isTextElement ? (selectedElement as TextElement) : null
  const fill =
    textElement?.fill || (selectedElement && 'fill' in selectedElement)
      ? (selectedElement as any).fill
      : '#000000'
  const fontSize = textElement?.fontSize || 48
  const fontWeight = textElement?.fontWeight || 'normal'
  const fontStyle = textElement?.fontStyle || 'normal'
  const textDecoration = textElement?.textDecoration || 'none'

  const handleFillChange = (color: string) => {
    if (selectedElement) {
      pushState(slides)
      updateElement(selectedElement.id, { fill: color } as any)
      useProjectStore.getState().markDirty()
    }
  }

  const handleFontSizeChange = (delta: number) => {
    if (textElement) {
      const newSize = Math.max(8, Math.min(200, fontSize + delta))
      pushState(slides)
      updateElement(textElement.id, { fontSize: newSize })
      useProjectStore.getState().markDirty()
    }
  }

  const toggleBold = () => {
    if (textElement) {
      pushState(slides)
      updateElement(textElement.id, {
        fontWeight: fontWeight === 'bold' ? 'normal' : 'bold',
      })
      useProjectStore.getState().markDirty()
    }
  }

  const toggleItalic = () => {
    if (textElement) {
      pushState(slides)
      updateElement(textElement.id, {
        fontStyle: fontStyle === 'italic' ? 'normal' : 'italic',
      })
      useProjectStore.getState().markDirty()
    }
  }

  const toggleUnderline = () => {
    if (textElement) {
      pushState(slides)
      updateElement(textElement.id, {
        textDecoration: textDecoration === 'underline' ? 'none' : 'underline',
      })
      useProjectStore.getState().markDirty()
    }
  }

  const toggleStrikethrough = () => {
    if (textElement) {
      pushState(slides)
      updateElement(textElement.id, {
        textDecoration: textDecoration === 'line-through' ? 'none' : 'line-through',
      })
      useProjectStore.getState().markDirty()
    }
  }

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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              {name}
              <Pencil className="h-3 w-3 text-gray-400" />
            </button>
          )}
          {isDirty && <span className="text-xs text-gray-400">Unsaved</span>}
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
            Save
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
          <Button variant="ghost" size="icon" onClick={addText} title="Add text">
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleImageUpload} title="Upload image">
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-6 w-px bg-gray-200" />

          {/* Basic Shapes */}
          <Button variant="ghost" size="icon" onClick={() => addShape('rect')} title="Rectangle">
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('circle')} title="Circle">
            <Circle className="h-4 w-4" />
          </Button>

          {/* More Shapes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 px-2" title="More shapes">
                <Triangle className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => addShape('triangle')}>
                <Triangle className="mr-2 h-4 w-4" />
                Triangle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addShape('star')}>
                <Star className="mr-2 h-4 w-4" />
                Star
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addShape('polygon', 5)}>
                <Pentagon className="mr-2 h-4 w-4" />
                Pentagon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addShape('polygon', 6)}>
                <Hexagon className="mr-2 h-4 w-4" />
                Hexagon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mx-1 h-6 w-px bg-gray-200" />

          {/* Lines & Arrows */}
          <Button variant="ghost" size="icon" onClick={() => addShape('line')} title="Line">
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('arrow')} title="Arrow">
            <MoveRight className="h-4 w-4" />
          </Button>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-1" title="Background color">
            <Palette className="text-muted-foreground h-4 w-4" />
            <ColorButton
              value={currentSlide?.backgroundColor || '#ffffff'}
              onChange={handleBackgroundChange}
            />
          </div>

          {selectedElement && (
            <>
              <div className="mx-2 h-6 w-px bg-gray-200" />

              <div className="flex items-center gap-1" title="Fill color">
                <span className="text-muted-foreground text-xs">Color:</span>
                <ColorButton value={fill} onChange={handleFillChange} />
              </div>

              {isTextElement && (
                <>
                  <div className="mx-2 h-6 w-px bg-gray-200" />

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleFontSizeChange(-4)}
                      title="Decrease font size"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{fontSize}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleFontSizeChange(4)}
                      title="Increase font size"
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
                    title="Bold"
                  >
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-7 w-7', fontStyle === 'italic' && 'bg-accent')}
                    onClick={toggleItalic}
                    title="Italic"
                  >
                    <Italic className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-7 w-7', textDecoration === 'underline' && 'bg-accent')}
                    onClick={toggleUnderline}
                    title="Underline"
                  >
                    <Underline className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-7 w-7', textDecoration === 'line-through' && 'bg-accent')}
                    onClick={toggleStrikethrough}
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-3 w-3" />
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
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            title="Delete (Del)"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
