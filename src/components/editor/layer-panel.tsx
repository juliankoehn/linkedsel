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
import { useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
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
  onDragStart: (elementId: string) => void
  onDragEnd: () => void
  onDropInto: (targetId: string | null) => void
  onReorder: (targetId: string, position: 'before' | 'after') => void
  draggedId: string | null
}

function LayerItem({
  element,
  depth,
  onDragStart,
  onDragEnd,
  onDropInto,
  onReorder,
  draggedId,
}: LayerItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'into' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)

  const { selectedIds, select, toggleSelection } = useSelectionStore()
  const { updateElement, renameElement, slides } = useSlidesStore()
  const { pushState } = useHistoryStore()
  const { markDirty } = useProjectStore()

  const isSelected = selectedIds.includes(element.id)
  const hasChildren = element.type === 'group' || element.type === 'frame'
  const children = hasChildren ? (element as GroupElement | FrameElement).children : []
  const canAcceptDrop = hasChildren && draggedId && draggedId !== element.id

  const Icon = getElementIcon(element.type)
  const name = getElementName(element)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEditing) return
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleSelection(element.id)
    } else {
      select(element.id)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Start editing name
    setEditName(element.name || getElementName(element))
    setIsEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== element.name) {
      pushState(slides)
      renameElement(element.id, editName.trim())
      markDirty()
    }
    setIsEditing(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
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

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(element.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggedId || draggedId === element.id) return
    e.preventDefault()
    e.stopPropagation()

    const rect = itemRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = e.clientY - rect.top
    const height = rect.height
    const threshold = height / 4

    // Determine drop position based on mouse position
    if (canAcceptDrop && y > threshold && y < height - threshold) {
      // Middle - drop into container
      setDropPosition('into')
    } else if (y < height / 2) {
      // Top half - before
      setDropPosition('before')
    } else {
      // Bottom half - after
      setDropPosition('after')
    }
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    setIsDragOver(false)
    setDropPosition(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (!draggedId || draggedId === element.id) {
      setDropPosition(null)
      return
    }

    if (dropPosition === 'into' && canAcceptDrop) {
      onDropInto(element.id)
    } else if (dropPosition === 'before' || dropPosition === 'after') {
      onReorder(element.id, dropPosition)
    }
    setDropPosition(null)
  }

  const handleDragEnd = () => {
    onDragEnd()
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="relative">
      {/* Drop indicator - before */}
      {isDragOver && dropPosition === 'before' && (
        <div
          className="absolute left-0 right-0 top-0 h-0.5 bg-blue-500"
          style={{ marginLeft: `${depth * 12 + 4}px` }}
        />
      )}
      <div
        ref={itemRef}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group flex h-7 cursor-pointer items-center gap-1 rounded px-1 text-xs transition-colors',
          isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100',
          !element.visible && 'opacity-50',
          isDragOver && dropPosition === 'into' && 'bg-blue-200 ring-2 ring-blue-400',
          draggedId === element.id && 'opacity-30'
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Expand/collapse for groups/frames */}
        {hasChildren ? (
          <button onClick={toggleExpand} className="flex h-4 w-4 items-center justify-center">
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

        {/* Name (editable) */}
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            className="h-5 flex-1 px-1 py-0 text-xs"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate">{name}</span>
        )}

        {/* Actions (visible on hover) */}
        {!isEditing && (
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
        )}
      </div>

      {/* Drop indicator - after */}
      {isDragOver && dropPosition === 'after' && !hasChildren && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
          style={{ marginLeft: `${depth * 12 + 4}px` }}
        />
      )}

      {/* Children */}
      {hasChildren && isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <LayerItem
              key={child.id}
              element={child}
              depth={depth + 1}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDropInto={onDropInto}
              onReorder={onReorder}
              draggedId={draggedId}
            />
          ))}
        </div>
      )}

      {/* Drop indicator - after (for containers, show after children) */}
      {isDragOver && dropPosition === 'after' && hasChildren && (
        <div className="h-0.5 bg-blue-500" style={{ marginLeft: `${depth * 12 + 4}px` }} />
      )}
    </div>
  )
}

export function LayerPanel() {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const {
    slides,
    currentSlideIndex,
    groupElements,
    ungroupElement,
    createFrameFromElements,
    moveElementToParent,
    reorderElement,
  } = useSlidesStore()
  const { selectedIds, clearSelection, select } = useSelectionStore()
  const { pushState } = useHistoryStore()
  const { markDirty } = useProjectStore()

  const currentSlide = slides[currentSlideIndex]
  const elements = currentSlide?.elements || []

  // Reverse to show top elements first (like Figma)
  const reversedElements = [...elements].reverse()

  const handleDragStart = (elementId: string) => {
    setDraggedId(elementId)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const handleDropInto = (targetParentId: string | null) => {
    if (!draggedId) return
    pushState(slides)
    moveElementToParent(draggedId, targetParentId)
    markDirty()
    setDraggedId(null)
  }

  const handleReorder = (targetId: string, position: 'before' | 'after') => {
    if (!draggedId) return
    pushState(slides)
    reorderElement(draggedId, targetId, position)
    markDirty()
    setDraggedId(null)
  }

  // Handle drop on root (outside any frame)
  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedId) {
      handleDropInto(null)
    }
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    if (draggedId) {
      e.preventDefault()
    }
  }

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
      <div
        className="min-h-0 flex-1 overflow-y-auto p-1"
        onDrop={handleRootDrop}
        onDragOver={handleRootDragOver}
      >
        {reversedElements.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
            Keine Elemente
          </div>
        ) : (
          reversedElements.map((element) => (
            <LayerItem
              key={element.id}
              element={element}
              depth={0}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropInto={handleDropInto}
              onReorder={handleReorder}
              draggedId={draggedId}
            />
          ))
        )}
      </div>
    </div>
  )
}
