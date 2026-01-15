/**
 * Yoga Layout utility for calculating flexbox-like layouts
 * Uses Facebook's Yoga WASM engine for high-performance layout calculations
 */

import Yoga, {
  Align,
  Direction,
  Edge,
  FlexDirection,
  Gutter,
  Justify,
  type Node,
  Wrap,
} from 'yoga-layout'

import type {
  AlignItems,
  CanvasElement,
  FrameElement,
  JustifyContent,
  LayoutMode,
  LayoutWrap,
} from '@/stores/slides-store'

export interface LayoutResult {
  id: string
  x: number
  y: number
  width: number
  height: number
}

// Map our layout types to Yoga constants
function mapFlexDirection(layoutMode: LayoutMode): FlexDirection {
  switch (layoutMode) {
    case 'horizontal':
      return FlexDirection.Row
    case 'vertical':
      return FlexDirection.Column
    default:
      return FlexDirection.Row
  }
}

function mapAlignItems(alignItems: AlignItems): Align {
  switch (alignItems) {
    case 'start':
      return Align.FlexStart
    case 'center':
      return Align.Center
    case 'end':
      return Align.FlexEnd
    case 'stretch':
      return Align.Stretch
    default:
      return Align.FlexStart
  }
}

function mapJustifyContent(justifyContent: JustifyContent): Justify {
  switch (justifyContent) {
    case 'start':
      return Justify.FlexStart
    case 'center':
      return Justify.Center
    case 'end':
      return Justify.FlexEnd
    case 'space-between':
      return Justify.SpaceBetween
    default:
      return Justify.FlexStart
  }
}

function mapWrap(wrap: LayoutWrap): Wrap {
  switch (wrap) {
    case 'wrap':
      return Wrap.Wrap
    case 'nowrap':
    default:
      return Wrap.NoWrap
  }
}

// Get element dimensions for layout
function getElementDimensions(element: CanvasElement): { width: number; height: number } {
  if (element.type === 'circle') {
    return { width: element.radius * 2, height: element.radius * 2 }
  }
  if ('width' in element && 'height' in element) {
    return { width: element.width, height: element.height }
  }
  return { width: 100, height: 100 }
}

/**
 * Calculate layout positions for frame children using Yoga
 * Returns computed positions for each child element
 */
export function calculateFrameLayout(frame: FrameElement): LayoutResult[] {
  // If no auto-layout, return original positions
  if (frame.layoutMode === 'none') {
    return frame.children.map((child) => {
      const dims = getElementDimensions(child)
      return {
        id: child.id,
        x: child.x,
        y: child.y,
        width: dims.width,
        height: dims.height,
      }
    })
  }

  // Create root node for frame
  const root = Yoga.Node.create()
  root.setWidth(frame.width)
  root.setHeight(frame.height)
  root.setFlexDirection(mapFlexDirection(frame.layoutMode))
  root.setAlignItems(mapAlignItems(frame.alignItems))
  root.setJustifyContent(mapJustifyContent(frame.justifyContent))
  root.setFlexWrap(mapWrap(frame.layoutWrap))
  root.setGap(Gutter.All, frame.gap || 0)

  // Set size constraints
  if (frame.minWidth !== undefined) root.setMinWidth(frame.minWidth)
  if (frame.maxWidth !== undefined) root.setMaxWidth(frame.maxWidth)
  if (frame.minHeight !== undefined) root.setMinHeight(frame.minHeight)
  if (frame.maxHeight !== undefined) root.setMaxHeight(frame.maxHeight)

  // Set padding
  root.setPadding(Edge.Top, frame.paddingTop || 0)
  root.setPadding(Edge.Right, frame.paddingRight || 0)
  root.setPadding(Edge.Bottom, frame.paddingBottom || 0)
  root.setPadding(Edge.Left, frame.paddingLeft || 0)

  // Create child nodes
  const childNodes: Node[] = []
  const childMap = new Map<number, string>()

  frame.children.forEach((child, index) => {
    const dims = getElementDimensions(child)
    const childNode = Yoga.Node.create()

    childNode.setWidth(dims.width)
    childNode.setHeight(dims.height)

    root.insertChild(childNode, index)
    childNodes.push(childNode)
    childMap.set(index, child.id)
  })

  // Calculate layout
  root.calculateLayout(frame.width, frame.height, Direction.LTR)

  // Extract results
  const results: LayoutResult[] = []

  childNodes.forEach((childNode, index) => {
    const childId = childMap.get(index)
    if (childId) {
      results.push({
        id: childId,
        x: childNode.getComputedLeft(),
        y: childNode.getComputedTop(),
        width: childNode.getComputedWidth(),
        height: childNode.getComputedHeight(),
      })
    }
  })

  // Clean up - free all nodes
  root.freeRecursive()

  return results
}

/**
 * Get the visual position of a specific child within a frame
 * Returns the Yoga-calculated position if auto-layout is enabled
 */
export function getChildVisualPosition(
  frame: FrameElement,
  childId: string
): { x: number; y: number } | null {
  const child = frame.children.find((c) => c.id === childId)
  if (!child) return null

  // If no auto-layout, use stored position
  if (frame.layoutMode === 'none') {
    return { x: child.x, y: child.y }
  }

  // Calculate layout and find the child's position
  const layoutResults = calculateFrameLayout(frame)
  const result = layoutResults.find((r) => r.id === childId)

  return result ? { x: result.x, y: result.y } : { x: child.x, y: child.y }
}

/**
 * Calculate if frame should auto-resize based on content
 */
export function calculateFrameAutoSize(
  frame: FrameElement
): { width: number; height: number } | null {
  if (!frame.autoWidth && !frame.autoHeight) {
    return null
  }

  if (frame.layoutMode === 'none' || frame.children.length === 0) {
    return null
  }

  // Create root node
  const root = Yoga.Node.create()

  // Set dimensions - undefined for auto
  if (!frame.autoWidth) {
    root.setWidth(frame.width)
  }
  if (!frame.autoHeight) {
    root.setHeight(frame.height)
  }

  root.setFlexDirection(mapFlexDirection(frame.layoutMode))
  root.setAlignItems(mapAlignItems(frame.alignItems))
  root.setJustifyContent(mapJustifyContent(frame.justifyContent))
  root.setFlexWrap(mapWrap(frame.layoutWrap))
  root.setGap(Gutter.All, frame.gap || 0)

  // Set size constraints
  if (frame.minWidth !== undefined) root.setMinWidth(frame.minWidth)
  if (frame.maxWidth !== undefined) root.setMaxWidth(frame.maxWidth)
  if (frame.minHeight !== undefined) root.setMinHeight(frame.minHeight)
  if (frame.maxHeight !== undefined) root.setMaxHeight(frame.maxHeight)

  // Set padding
  root.setPadding(Edge.Top, frame.paddingTop || 0)
  root.setPadding(Edge.Right, frame.paddingRight || 0)
  root.setPadding(Edge.Bottom, frame.paddingBottom || 0)
  root.setPadding(Edge.Left, frame.paddingLeft || 0)

  // Add children
  frame.children.forEach((child, index) => {
    const dims = getElementDimensions(child)
    const childNode = Yoga.Node.create()
    childNode.setWidth(dims.width)
    childNode.setHeight(dims.height)
    root.insertChild(childNode, index)
  })

  // Calculate with undefined for auto dimensions
  root.calculateLayout(
    frame.autoWidth ? undefined : frame.width,
    frame.autoHeight ? undefined : frame.height,
    Direction.LTR
  )

  const result = {
    width: frame.autoWidth ? root.getComputedWidth() : frame.width,
    height: frame.autoHeight ? root.getComputedHeight() : frame.height,
  }

  // Clean up
  root.freeRecursive()

  return result
}
