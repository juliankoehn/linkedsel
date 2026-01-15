'use client'

import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Frame,
  Group,
  Image,
  Lock,
  Minus,
  MoveRight,
  Shapes,
  Square,
  Star,
  Type,
  Unlock,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import {
  type CanvasElement,
  type FrameElement,
  type GroupElement,
  useSlidesStore,
} from '@/stores/slides-store'

// Icon mapping for element types
function getElementIcon(type: CanvasElement['type']) {
  switch (type) {
    case 'text':
      return Type
    case 'image':
      return Image
    case 'rect':
      return Square
    case 'circle':
      return Shapes
    case 'line':
      return Minus
    case 'arrow':
      return MoveRight
    case 'triangle':
    case 'polygon':
    case 'star':
      return Star
    case 'icon':
      return Shapes
    case 'group':
      return Group
    case 'frame':
      return Frame
    default:
      return Square
  }
}

// Get display name for element
function getElementName(element: CanvasElement): string {
  if (element.name) return element.name

  switch (element.type) {
    case 'text':
      return (element as any).text?.slice(0, 20) || 'Text'
    case 'image':
      return 'Bild'
    case 'rect':
      return 'Rechteck'
    case 'circle':
      return 'Kreis'
    case 'line':
      return 'Linie'
    case 'arrow':
      return 'Pfeil'
    case 'triangle':
      return 'Dreieck'
    case 'polygon':
      return `Polygon (${(element as any).sides || 6})`
    case 'star':
      return 'Stern'
    case 'icon':
      return (element as any).iconName || 'Icon'
    case 'group':
      return 'Gruppe'
    case 'frame':
      return 'Frame'
    default:
      return 'Element'
  }
}

interface LayerItemProps {
  element: CanvasElement
  depth: number
}

function LayerItem({ element, depth }: LayerItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { selectedIds, select, toggleSelection } = useSelectionStore()
  const { updateElement, slides } = useSlidesStore()
  const { pushState } = useHistoryStore()
  const { markDirty } = useProjectStore()

  const isSelected = selectedIds.includes(element.id)
  const hasChildren = element.type === 'group' || element.type === 'frame'
  const children = hasChildren ? (element as GroupElement | FrameElement).children : []

  const Icon = getElementIcon(element.type)
  const name = getElementName(element)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleSelection(element.id)
    } else {
      select(element.id)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    pushState(slides)
    updateElement(element.id, { visible: !element.visible })
    markDirty()
  }

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation()
    pushState(slides)
    updateElement(element.id, { locked: !element.locked })
    markDirty()
  }

  return (
    <div>
      <div
        className={cn(
          'group flex h-7 cursor-pointer items-center gap-1 rounded px-1 text-xs transition-colors',
          isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100',
          !element.visible && 'opacity-50'
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Expand/collapse for groups/frames */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="flex h-4 w-4 items-center justify-center"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Icon */}
        <Icon className="h-3.5 w-3.5 shrink-0 stroke-current" />

        {/* Name */}
        <span className="flex-1 truncate">{name}</span>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={toggleVisibility}
            className="rounded p-0.5 hover:bg-gray-200"
            title={element.visible ? 'Ausblenden' : 'Einblenden'}
          >
            {element.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            onClick={toggleLock}
            className="rounded p-0.5 hover:bg-gray-200"
            title={element.locked ? 'Entsperren' : 'Sperren'}
          >
            {element.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <LayerItem key={child.id} element={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function LayerPanel() {
  const { slides, currentSlideIndex, groupElements, ungroupElement, createFrameFromElements } =
    useSlidesStore()
  const { selectedIds, clearSelection, select } = useSelectionStore()
  const { pushState } = useHistoryStore()
  const { markDirty } = useProjectStore()

  const currentSlide = slides[currentSlideIndex]
  const elements = currentSlide?.elements || []

  // Reverse to show top elements first (like Figma)
  const reversedElements = [...elements].reverse()

  const handleGroup = () => {
    if (selectedIds.length < 2) return
    pushState(slides)
    const groupId = groupElements(selectedIds)
    if (groupId) {
      clearSelection()
      select(groupId)
      markDirty()
    }
  }

  const handleUngroup = () => {
    if (selectedIds.length !== 1) return
    const element = elements.find((el) => el.id === selectedIds[0])
    if (!element || (element.type !== 'group' && element.type !== 'frame')) return

    pushState(slides)
    ungroupElement(selectedIds[0]!)
    clearSelection()
    markDirty()
  }

  const handleCreateFrame = () => {
    if (selectedIds.length < 1) return
    pushState(slides)
    const frameId = createFrameFromElements(selectedIds)
    if (frameId) {
      clearSelection()
      select(frameId)
      markDirty()
    }
  }

  const selectedElement =
    selectedIds.length === 1 ? elements.find((el) => el.id === selectedIds[0]) : null
  const canUngroup = selectedElement?.type === 'group' || selectedElement?.type === 'frame'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-2 py-1.5">
        <span className="text-[10px] font-medium text-gray-500">Ebenen</span>
        <div className="flex gap-1">
          <button
            onClick={handleCreateFrame}
            disabled={selectedIds.length < 1}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
            title="Frame erstellen"
          >
            <Frame className="h-3 w-3" />
          </button>
          <button
            onClick={handleGroup}
            disabled={selectedIds.length < 2}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
            title="Gruppieren (⌘G)"
          >
            <Group className="h-3 w-3" />
          </button>
          {canUngroup && (
            <button
              onClick={handleUngroup}
              className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="Gruppierung aufheben (⌘⇧G)"
            >
              <Unlock className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Layer list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {reversedElements.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
            Keine Elemente
          </div>
        ) : (
          reversedElements.map((element) => (
            <LayerItem key={element.id} element={element} depth={0} />
          ))
        )}
      </div>
    </div>
  )
}
