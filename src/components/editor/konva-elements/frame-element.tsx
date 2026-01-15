'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { useMemo } from 'react'
import { Group, Rect } from 'react-konva'

import type { CanvasElement, FrameElement as FrameElementType } from '@/stores/slides-store'

import { ElementRenderer } from './index'

interface FrameElementProps {
  element: FrameElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<FrameElementType>) => void
}

// Calculate the size of an element (handles different element types)
function getElementSize(element: CanvasElement): { width: number; height: number } {
  if (element.type === 'circle') {
    return { width: element.radius * 2, height: element.radius * 2 }
  }
  if ('width' in element && 'height' in element) {
    return { width: element.width, height: element.height }
  }
  return { width: 100, height: 100 } // Default fallback
}

// Calculate layout positions for children based on frame's auto-layout settings
function calculateAutoLayout(frame: FrameElementType): Array<{ id: string; x: number; y: number }> {
  const { children, layoutMode, gap, alignItems, justifyContent } = frame
  const paddingTop = frame.paddingTop || 0
  const paddingRight = frame.paddingRight || 0
  const paddingBottom = frame.paddingBottom || 0
  const paddingLeft = frame.paddingLeft || 0

  // Available space inside frame
  const contentWidth = frame.width - paddingLeft - paddingRight
  const contentHeight = frame.height - paddingTop - paddingBottom

  // If no layout mode, return original positions (relative to frame)
  if (layoutMode === 'none') {
    return children.map((child) => ({
      id: child.id,
      x: child.x,
      y: child.y,
    }))
  }

  const isHorizontal = layoutMode === 'horizontal'
  const positions: Array<{ id: string; x: number; y: number }> = []

  // Calculate total size of all children
  let totalMainSize = 0
  let maxCrossSize = 0
  const childSizes = children.map((child) => {
    const size = getElementSize(child)
    totalMainSize += isHorizontal ? size.width : size.height
    maxCrossSize = Math.max(maxCrossSize, isHorizontal ? size.height : size.width)
    return size
  })

  // Add gaps to total
  if (children.length > 1) {
    totalMainSize += gap * (children.length - 1)
  }

  // Calculate starting position based on justifyContent
  const mainAxisSize = isHorizontal ? contentWidth : contentHeight
  const crossAxisSize = isHorizontal ? contentHeight : contentWidth

  let mainStart = isHorizontal ? paddingLeft : paddingTop
  switch (justifyContent) {
    case 'center':
      mainStart += (mainAxisSize - totalMainSize) / 2
      break
    case 'end':
      mainStart += mainAxisSize - totalMainSize
      break
    case 'space-between':
      // Will be handled in the loop
      break
    case 'start':
    default:
      // Already at start
      break
  }

  // Calculate positions for each child
  let currentMain = mainStart
  const spaceBetween =
    justifyContent === 'space-between' && children.length > 1
      ? (mainAxisSize - totalMainSize + gap * (children.length - 1)) / (children.length - 1)
      : gap

  children.forEach((child, index) => {
    const size = childSizes[index]!
    const childMainSize = isHorizontal ? size.width : size.height
    const childCrossSize = isHorizontal ? size.height : size.width

    // Calculate cross-axis position based on alignItems
    let crossPos = isHorizontal ? paddingTop : paddingLeft
    switch (alignItems) {
      case 'center':
        crossPos += (crossAxisSize - childCrossSize) / 2
        break
      case 'end':
        crossPos += crossAxisSize - childCrossSize
        break
      case 'stretch':
        // For stretch, we'd need to resize the element - for now just start
        break
      case 'start':
      default:
        // Already at start
        break
    }

    positions.push({
      id: child.id,
      x: isHorizontal ? currentMain : crossPos,
      y: isHorizontal ? crossPos : currentMain,
    })

    currentMain += childMainSize + spaceBetween
  })

  return positions
}

export function FrameElement({
  element,
  isSelected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: FrameElementProps) {
  // Calculate layout positions for children
  const layoutPositions = useMemo(() => calculateAutoLayout(element), [element])

  // Create a map for quick lookup
  const positionMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    layoutPositions.forEach((pos) => map.set(pos.id, { x: pos.x, y: pos.y }))
    return map
  }, [layoutPositions])

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={(e) => onSelect(element.id, e)}
      onTap={(e) => onSelect(element.id, e as unknown as KonvaEventObject<MouseEvent>)}
      onDragStart={() => onDragStart(element.id)}
      onDragMove={(e) => {
        const node = e.target
        onDragMove(element.id, node.x(), node.y())
      }}
      onDragEnd={() => onDragEnd(element.id)}
      // Clip children to frame bounds
      clipFunc={(ctx) => {
        ctx.rect(0, 0, element.width, element.height)
      }}
    >
      {/* Frame background */}
      <Rect
        width={element.width}
        height={element.height}
        fill={element.fill || undefined}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
        cornerRadius={element.cornerRadius || 0}
      />

      {/* Frame border when selected (dashed) */}
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#0066ff"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}

      {/* Render children with calculated layout positions */}
      {element.children.map((child) => {
        const layoutPos = positionMap.get(child.id)
        // Override child position with layout-calculated position
        const positionedChild =
          element.layoutMode !== 'none' && layoutPos
            ? { ...child, x: layoutPos.x, y: layoutPos.y }
            : child

        return (
          <ElementRenderer
            key={child.id}
            element={positionedChild}
            isSelected={false}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd as (id: string, updates: Partial<CanvasElement>) => void}
          />
        )
      })}
    </Group>
  )
}
