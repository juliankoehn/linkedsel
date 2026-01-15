'use client'

import {
  AlignCenter,
  AlignEndHorizontal,
  AlignStartHorizontal,
  ArrowDownToLine,
  ArrowUpToLine,
  Link,
  Link2Off,
  RotateCcw,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { ColorButton } from '@/components/editor/color-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import { type FrameElement, type LayoutMode, useSlidesStore } from '@/stores/slides-store'

// Frame-specific properties component
interface FramePropertiesProps {
  element: FrameElement
  onUpdate: (updates: Record<string, number | string | boolean>) => void
}

function FrameProperties({ element, onUpdate }: FramePropertiesProps) {
  const { updateFrameLayout } = useSlidesStore()

  const handleLayoutChange = (layoutMode: LayoutMode) => {
    onUpdate({ layoutMode })
    // Trigger layout recalculation
    setTimeout(() => updateFrameLayout(element.id), 0)
  }

  const handleLayoutUpdate = (updates: Record<string, number | string | boolean>) => {
    onUpdate(updates)
    if (element.layoutMode !== 'none') {
      setTimeout(() => updateFrameLayout(element.id), 0)
    }
  }

  return (
    <div className="mb-3 border-t pt-3">
      <Label className="mb-2 block text-[10px] font-medium text-gray-400">Auto-Layout</Label>

      {/* Layout Mode */}
      <div className="mb-2">
        <div className="flex gap-1">
          <button
            onClick={() => handleLayoutChange('none')}
            className={`flex-1 rounded border py-1 text-[10px] ${
              element.layoutMode === 'none'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Keine
          </button>
          <button
            onClick={() => handleLayoutChange('horizontal')}
            className={`flex-1 rounded border py-1 text-[10px] ${
              element.layoutMode === 'horizontal'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            →
          </button>
          <button
            onClick={() => handleLayoutChange('vertical')}
            className={`flex-1 rounded border py-1 text-[10px] ${
              element.layoutMode === 'vertical'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ↓
          </button>
        </div>
      </div>

      {element.layoutMode !== 'none' && (
        <>
          {/* Wrap */}
          <div className="mb-2">
            <Label className="mb-1 block text-[10px] text-gray-400">Wrap</Label>
            <div className="flex gap-1">
              <button
                onClick={() => handleLayoutUpdate({ layoutWrap: 'nowrap' })}
                className={`flex-1 rounded border py-1 text-[10px] ${
                  element.layoutWrap === 'nowrap'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Nein
              </button>
              <button
                onClick={() => handleLayoutUpdate({ layoutWrap: 'wrap' })}
                className={`flex-1 rounded border py-1 text-[10px] ${
                  element.layoutWrap === 'wrap'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Ja
              </button>
            </div>
          </div>

          {/* Gap */}
          <div className="mb-2">
            <Label className="mb-1 block text-[10px] text-gray-400">Gap</Label>
            <Input
              type="number"
              value={element.gap}
              onChange={(e) => handleLayoutUpdate({ gap: Number(e.target.value) })}
              className="h-7 text-xs"
              min={0}
            />
          </div>

          {/* Padding */}
          <div className="mb-2">
            <Label className="mb-1 block text-[10px] text-gray-400">Padding</Label>
            <div className="grid grid-cols-4 gap-1">
              <Input
                type="number"
                value={element.paddingTop}
                onChange={(e) => handleLayoutUpdate({ paddingTop: Number(e.target.value) })}
                className="h-7 text-xs"
                min={0}
                placeholder="↑"
                title="Oben"
              />
              <Input
                type="number"
                value={element.paddingRight}
                onChange={(e) => handleLayoutUpdate({ paddingRight: Number(e.target.value) })}
                className="h-7 text-xs"
                min={0}
                placeholder="→"
                title="Rechts"
              />
              <Input
                type="number"
                value={element.paddingBottom}
                onChange={(e) => handleLayoutUpdate({ paddingBottom: Number(e.target.value) })}
                className="h-7 text-xs"
                min={0}
                placeholder="↓"
                title="Unten"
              />
              <Input
                type="number"
                value={element.paddingLeft}
                onChange={(e) => handleLayoutUpdate({ paddingLeft: Number(e.target.value) })}
                className="h-7 text-xs"
                min={0}
                placeholder="←"
                title="Links"
              />
            </div>
          </div>

          {/* Alignment */}
          <div className="mb-2">
            <Label className="mb-1 block text-[10px] text-gray-400">Ausrichtung</Label>
            <div className="flex gap-1">
              <button
                onClick={() => handleLayoutUpdate({ alignItems: 'start' })}
                className={`flex-1 rounded border py-1.5 ${
                  element.alignItems === 'start'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="Start"
              >
                <AlignStartHorizontal className="mx-auto h-3 w-3" />
              </button>
              <button
                onClick={() => handleLayoutUpdate({ alignItems: 'center' })}
                className={`flex-1 rounded border py-1.5 ${
                  element.alignItems === 'center'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="Center"
              >
                <AlignCenter className="mx-auto h-3 w-3" />
              </button>
              <button
                onClick={() => handleLayoutUpdate({ alignItems: 'end' })}
                className={`flex-1 rounded border py-1.5 ${
                  element.alignItems === 'end'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="End"
              >
                <AlignEndHorizontal className="mx-auto h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Frame Visual Properties */}
      <div className="mt-3 border-t pt-3">
        <Label className="mb-2 block text-[10px] font-medium text-gray-400">Frame Style</Label>

        {/* Fill Color */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Hintergrund</span>
          <ColorButton
            value={element.fill || 'transparent'}
            onChange={(color) => onUpdate({ fill: color })}
          />
        </div>

        {/* Corner Radius */}
        <div className="mb-2">
          <Label className="mb-1 block text-[10px] text-gray-400">Eckenradius</Label>
          <Input
            type="number"
            value={element.cornerRadius || 0}
            onChange={(e) => onUpdate({ cornerRadius: Number(e.target.value) })}
            className="h-7 text-xs"
            min={0}
          />
        </div>
      </div>
    </div>
  )
}

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
    <aside className="max-h-[calc(100vh-8rem)] w-48 flex-shrink-0 overflow-y-auto rounded-lg border bg-white/95 p-3 shadow-lg backdrop-blur">
      <h3 className="mb-3 text-xs font-medium text-gray-500">Properties</h3>

      {/* Position */}
      <div className="mb-3">
        <Label className="mb-1.5 block text-[10px] font-medium text-gray-400">Position</Label>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <span className="mb-0.5 block text-[10px] text-gray-400">X</span>
            <Input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <span className="mb-0.5 block text-[10px] text-gray-400">Y</span>
            <Input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="text-[10px] font-medium text-gray-400">Size</Label>
          <button
            className="rounded p-0.5 hover:bg-gray-100"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            title={lockAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {lockAspectRatio ? (
              <Link className="h-3 w-3 text-blue-500" />
            ) : (
              <Link2Off className="h-3 w-3 text-gray-400" />
            )}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <span className="mb-0.5 block text-[10px] text-gray-400">W</span>
            <Input
              type="number"
              value={Math.round(selectedElement.width)}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <span className="mb-0.5 block text-[10px] text-gray-400">H</span>
            <Input
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="text-[10px] font-medium text-gray-400">Rotation</Label>
          <button
            className="rounded p-0.5 hover:bg-gray-100"
            onClick={handleResetRotation}
            title="Reset rotation"
          >
            <RotateCcw className="h-3 w-3 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={Math.round(selectedElement.rotation)}
            onChange={(e) => handleUpdate({ rotation: Number(e.target.value) % 360 })}
            className="h-7 flex-1 text-xs"
            min={-360}
            max={360}
          />
          <span className="text-[10px] text-gray-400">°</span>
        </div>
      </div>

      {/* Opacity */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="text-[10px] font-medium text-gray-400">Opacity</Label>
          <span className="text-[10px] text-gray-400">
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

      {/* Frame Properties */}
      {selectedElement.type === 'frame' && (
        <FrameProperties element={selectedElement as FrameElement} onUpdate={handleUpdate} />
      )}

      {/* Layer controls */}
      <div>
        <Label className="mb-1.5 block text-[10px] font-medium text-gray-400">Layer</Label>
        <div className="flex gap-1">
          <button
            className="flex flex-1 items-center justify-center gap-1 rounded border py-1.5 text-[10px] text-gray-600 hover:bg-gray-50"
            onClick={handleBringToFront}
            title="Bring to front"
          >
            <ArrowUpToLine className="h-3 w-3" />
            Front
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-1 rounded border py-1.5 text-[10px] text-gray-600 hover:bg-gray-50"
            onClick={handleSendToBack}
            title="Send to back"
          >
            <ArrowDownToLine className="h-3 w-3" />
            Back
          </button>
        </div>
      </div>
    </aside>
  )
}
