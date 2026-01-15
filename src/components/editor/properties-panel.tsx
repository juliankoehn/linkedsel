'use client'

import { ArrowDownToLine, ArrowUpToLine, Link, Link2Off, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import { useSlidesStore } from '@/stores/slides-store'

export function PropertiesPanel() {
  const { selectedIds } = useSelectionStore()
  const { slides, currentSlideIndex, updateElement, bringToFront, sendToBack } = useSlidesStore()
  const { pushState } = useHistoryStore()

  const [lockAspectRatio, setLockAspectRatio] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1)

  const currentSlide = slides[currentSlideIndex]
  const selectedElement =
    selectedIds.length === 1 ? currentSlide?.elements.find((el) => el.id === selectedIds[0]) : null

  // Update aspect ratio when element changes
  useEffect(() => {
    if (selectedElement && selectedElement.width && selectedElement.height) {
      setAspectRatio(selectedElement.width / selectedElement.height)
    }
  }, [selectedElement?.id])

  const handleUpdate = useCallback(
    (updates: Record<string, number | string | boolean>) => {
      if (!selectedElement) return
      pushState(slides)
      updateElement(selectedElement.id, updates)
      useProjectStore.getState().markDirty()
    },
    [selectedElement, pushState, slides, updateElement]
  )

  const handleWidthChange = (value: number) => {
    if (!selectedElement) return
    const updates: Record<string, number> = { width: value }
    if (lockAspectRatio) {
      updates.height = value / aspectRatio
    }
    handleUpdate(updates)
  }

  const handleHeightChange = (value: number) => {
    if (!selectedElement) return
    const updates: Record<string, number> = { height: value }
    if (lockAspectRatio) {
      updates.width = value * aspectRatio
    }
    handleUpdate(updates)
  }

  const handleBringToFront = () => {
    if (!selectedElement) return
    pushState(slides)
    bringToFront(selectedElement.id)
    useProjectStore.getState().markDirty()
  }

  const handleSendToBack = () => {
    if (!selectedElement) return
    pushState(slides)
    sendToBack(selectedElement.id)
    useProjectStore.getState().markDirty()
  }

  const handleResetRotation = () => {
    if (!selectedElement) return
    handleUpdate({ rotation: 0 })
  }

  // Don't show if no element selected
  if (!selectedElement) return null

  return (
    <aside className="max-h-[calc(100vh-12rem)] w-56 flex-shrink-0 overflow-y-auto rounded-lg border bg-white p-4 shadow-lg">
      <h3 className="mb-4 text-sm font-medium text-gray-900">Properties</h3>

      {/* Position */}
      <div className="mb-4">
        <Label className="mb-2 block text-xs text-gray-500">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-xs text-gray-400">X</span>
            <Input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <span className="mb-1 block text-xs text-gray-400">Y</span>
            <Input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs text-gray-500">Size</Label>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            title={lockAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {lockAspectRatio ? (
              <Link className="h-3 w-3" />
            ) : (
              <Link2Off className="h-3 w-3 text-gray-400" />
            )}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-xs text-gray-400">W</span>
            <Input
              type="number"
              value={Math.round(selectedElement.width)}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <span className="mb-1 block text-xs text-gray-400">H</span>
            <Input
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs text-gray-500">Rotation</Label>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleResetRotation}
            title="Reset rotation"
          >
            <RotateCcw className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={Math.round(selectedElement.rotation)}
            onChange={(e) => handleUpdate({ rotation: Number(e.target.value) % 360 })}
            className="h-8 flex-1 text-sm"
            min={-360}
            max={360}
          />
          <span className="text-xs text-gray-400">°</span>
        </div>
      </div>

      {/* Opacity */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs text-gray-500">Opacity</Label>
          <span className="text-xs text-gray-400">
            {Math.round(selectedElement.opacity * 100)}%
          </span>
        </div>
        <Slider
          value={[selectedElement.opacity * 100]}
          onValueChange={(values) => handleUpdate({ opacity: (values[0] ?? 100) / 100 })}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Layer controls */}
      <div>
        <Label className="mb-2 block text-xs text-gray-500">Layer</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleBringToFront}
            title="Bring to front"
          >
            <ArrowUpToLine className="mr-1 h-3 w-3" />
            Front
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleSendToBack}
            title="Send to back"
          >
            <ArrowDownToLine className="mr-1 h-3 w-3" />
            Back
          </Button>
        </div>
      </div>
    </aside>
  )
}
