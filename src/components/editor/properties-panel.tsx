'use client'

import {
  ArrowDownToLine,
  ArrowUpToLine,
  Columns3,
  GripHorizontal,
  Link,
  Link2Off,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  Rows3,
  Unlink,
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

// 9-point alignment grid component
function AlignmentGrid({
  alignItems,
  justifyContent,
  onChange,
}: {
  alignItems: string
  justifyContent: string
  onChange: (align: string, justify: string) => void
}) {
  const positions = [
    { align: 'start', justify: 'start' },
    { align: 'start', justify: 'center' },
    { align: 'start', justify: 'end' },
    { align: 'center', justify: 'start' },
    { align: 'center', justify: 'center' },
    { align: 'center', justify: 'end' },
    { align: 'end', justify: 'start' },
    { align: 'end', justify: 'center' },
    { align: 'end', justify: 'end' },
  ]

  return (
    <div className="grid grid-cols-3 gap-1 rounded-md border bg-gray-50 p-2">
      {positions.map(({ align, justify }, i) => {
        const isSelected = alignItems === align && justifyContent === justify
        return (
          <button
            key={i}
            onClick={() => onChange(align, justify)}
            className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
              isSelected ? 'bg-blue-500' : 'hover:bg-gray-200'
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-400'}`}
            />
          </button>
        )
      })}
    </div>
  )
}

function FrameProperties({ element, onUpdate }: FramePropertiesProps) {
  const { updateFrameLayout } = useSlidesStore()
  const [showIndividualPadding, setShowIndividualPadding] = useState(false)

  const handleLayoutChange = (layoutMode: LayoutMode) => {
    onUpdate({ layoutMode })
    setTimeout(() => updateFrameLayout(element.id), 0)
  }

  const handleLayoutUpdate = (updates: Record<string, number | string | boolean>) => {
    onUpdate(updates)
    if (element.layoutMode !== 'none') {
      setTimeout(() => updateFrameLayout(element.id), 0)
    }
  }

  // Handle uniform padding (horizontal/vertical)
  const handleHorizontalPadding = (value: number) => {
    handleLayoutUpdate({ paddingLeft: value, paddingRight: value })
  }

  const handleVerticalPadding = (value: number) => {
    handleLayoutUpdate({ paddingTop: value, paddingBottom: value })
  }

  return (
    <div className="mb-3 border-t pt-3">
      <Label className="mb-2 block text-[10px] font-medium text-gray-400">Auto-Layout</Label>

      {/* Layout Mode - Flow */}
      <div className="mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleLayoutChange('none')}
            className={`rounded border p-1.5 ${
              element.layoutMode === 'none'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            title="Kein Auto-Layout"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleLayoutChange('horizontal')}
            className={`rounded border p-1.5 ${
              element.layoutMode === 'horizontal'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            title="Horizontal"
          >
            <Columns3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleLayoutChange('vertical')}
            className={`rounded border p-1.5 ${
              element.layoutMode === 'vertical'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            title="Vertikal"
          >
            <Rows3 className="h-3.5 w-3.5" />
          </button>
          <div className="flex-1" />
          {element.layoutMode !== 'none' && (
            <button
              onClick={() =>
                handleLayoutUpdate({
                  layoutWrap: element.layoutWrap === 'wrap' ? 'nowrap' : 'wrap',
                })
              }
              className={`rounded border p-1.5 ${
                element.layoutWrap === 'wrap'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Wrap umschalten"
            >
              <GripHorizontal className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {element.layoutMode !== 'none' && (
        <>
          {/* Alignment Grid + Gap */}
          <div className="mb-3 flex gap-3">
            <div>
              <Label className="mb-1 block text-[10px] text-gray-400">Ausrichtung</Label>
              <AlignmentGrid
                alignItems={element.alignItems}
                justifyContent={element.justifyContent}
                onChange={(align, justify) =>
                  handleLayoutUpdate({ alignItems: align, justifyContent: justify })
                }
              />
            </div>
            <div className="flex-1">
              <Label className="mb-1 block text-[10px] text-gray-400">Gap</Label>
              <div className="flex items-center gap-1">
                <MoveHorizontal className="h-3 w-3 text-gray-400" />
                <Input
                  type="number"
                  value={element.gap}
                  onChange={(e) => handleLayoutUpdate({ gap: Number(e.target.value) })}
                  className="h-7 text-xs"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Padding */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <Label className="text-[10px] text-gray-400">Padding</Label>
              <button
                onClick={() => setShowIndividualPadding(!showIndividualPadding)}
                className={`rounded p-0.5 hover:bg-gray-100 ${showIndividualPadding ? 'text-blue-500' : 'text-gray-400'}`}
                title={showIndividualPadding ? 'Vereinfacht' : 'Individuell'}
              >
                <GripHorizontal className="h-3 w-3" />
              </button>
            </div>
            {showIndividualPadding ? (
              // Individual padding (4 inputs)
              <div className="grid grid-cols-4 gap-1">
                <Input
                  type="number"
                  value={element.paddingTop}
                  onChange={(e) => handleLayoutUpdate({ paddingTop: Number(e.target.value) })}
                  className="h-7 text-xs"
                  min={0}
                  title="Oben"
                />
                <Input
                  type="number"
                  value={element.paddingRight}
                  onChange={(e) => handleLayoutUpdate({ paddingRight: Number(e.target.value) })}
                  className="h-7 text-xs"
                  min={0}
                  title="Rechts"
                />
                <Input
                  type="number"
                  value={element.paddingBottom}
                  onChange={(e) => handleLayoutUpdate({ paddingBottom: Number(e.target.value) })}
                  className="h-7 text-xs"
                  min={0}
                  title="Unten"
                />
                <Input
                  type="number"
                  value={element.paddingLeft}
                  onChange={(e) => handleLayoutUpdate({ paddingLeft: Number(e.target.value) })}
                  className="h-7 text-xs"
                  min={0}
                  title="Links"
                />
              </div>
            ) : (
              // Simplified padding (horizontal + vertical)
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <MoveHorizontal className="h-3 w-3 flex-shrink-0 text-gray-400" />
                  <Input
                    type="number"
                    value={element.paddingLeft}
                    onChange={(e) => handleHorizontalPadding(Number(e.target.value))}
                    className="h-7 text-xs"
                    min={0}
                    title="Horizontal"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <MoveVertical className="h-3 w-3 flex-shrink-0 text-gray-400" />
                  <Input
                    type="number"
                    value={element.paddingTop}
                    onChange={(e) => handleVerticalPadding(Number(e.target.value))}
                    className="h-7 text-xs"
                    min={0}
                    title="Vertikal"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Frame Visual Properties */}
      <div className="border-t pt-3">
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
