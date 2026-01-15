import type { Guideline } from '@/stores/canvas-store'
import type { CanvasElement } from '@/stores/slides-store'

export interface SnapPoint {
  x: number
  y: number
  label: string
}

const SNAP_THRESHOLD = 5

// Get all snap points for an element
export function getSnapPoints(element: CanvasElement): SnapPoint[] {
  const { x, y, width, height } = element
  const centerX = x + width / 2
  const centerY = y + height / 2

  return [
    // Corners
    { x, y, label: 'tl' },
    { x: x + width, y, label: 'tr' },
    { x, y: y + height, label: 'bl' },
    { x: x + width, y: y + height, label: 'br' },
    // Edge midpoints
    { x: centerX, y, label: 'tc' },
    { x: centerX, y: y + height, label: 'bc' },
    { x, y: centerY, label: 'ml' },
    { x: x + width, y: centerY, label: 'mr' },
    // Center
    { x: centerX, y: centerY, label: 'c' },
  ]
}

// Calculate snap for a dragging element
export function calculateSnap(
  draggingElement: CanvasElement,
  allElements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = SNAP_THRESHOLD
): {
  x: number
  y: number
  guidelines: Guideline[]
} {
  const snapPoints = getSnapPoints(draggingElement)
  const otherElements = allElements.filter((el) => el.id !== draggingElement.id)

  // Collect all target points from other elements
  const targetPoints = otherElements.flatMap(getSnapPoints)

  // Add canvas center lines as targets
  targetPoints.push(
    { x: canvasWidth / 2, y: canvasHeight / 2, label: 'canvas-center' },
    { x: canvasWidth / 2, y: 0, label: 'canvas-center-v' },
    { x: 0, y: canvasHeight / 2, label: 'canvas-center-h' }
  )

  let snapX: number | null = null
  let snapY: number | null = null
  const guidelines: Guideline[] = []
  const addedGuidelinePositions = new Set<string>()

  // Find closest snap for X
  for (const point of snapPoints) {
    if (snapX !== null && snapY !== null) break

    for (const target of targetPoints) {
      // Snap X
      if (snapX === null && Math.abs(point.x - target.x) < threshold) {
        snapX = target.x - (point.x - draggingElement.x)
        const guideKey = `v-${target.x}`
        if (!addedGuidelinePositions.has(guideKey)) {
          guidelines.push({ type: 'vertical', position: target.x })
          addedGuidelinePositions.add(guideKey)
        }
      }

      // Snap Y
      if (snapY === null && Math.abs(point.y - target.y) < threshold) {
        snapY = target.y - (point.y - draggingElement.y)
        const guideKey = `h-${target.y}`
        if (!addedGuidelinePositions.has(guideKey)) {
          guidelines.push({ type: 'horizontal', position: target.y })
          addedGuidelinePositions.add(guideKey)
        }
      }
    }
  }

  return {
    x: snapX ?? draggingElement.x,
    y: snapY ?? draggingElement.y,
    guidelines,
  }
}

// Calculate snap during resize
export function calculateResizeSnap(
  element: CanvasElement,
  newWidth: number,
  newHeight: number,
  allElements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = SNAP_THRESHOLD
): {
  width: number
  height: number
  guidelines: Guideline[]
} {
  const otherElements = allElements.filter((el) => el.id !== element.id)
  const targetPoints = otherElements.flatMap(getSnapPoints)

  // Add canvas edges
  targetPoints.push(
    { x: canvasWidth, y: 0, label: 'canvas-right' },
    { x: 0, y: canvasHeight, label: 'canvas-bottom' }
  )

  let snappedWidth = newWidth
  let snappedHeight = newHeight
  const guidelines: Guideline[] = []

  const rightEdge = element.x + newWidth
  const bottomEdge = element.y + newHeight

  for (const target of targetPoints) {
    // Snap right edge
    if (Math.abs(rightEdge - target.x) < threshold) {
      snappedWidth = target.x - element.x
      guidelines.push({ type: 'vertical', position: target.x })
    }

    // Snap bottom edge
    if (Math.abs(bottomEdge - target.y) < threshold) {
      snappedHeight = target.y - element.y
      guidelines.push({ type: 'horizontal', position: target.y })
    }
  }

  return {
    width: snappedWidth,
    height: snappedHeight,
    guidelines,
  }
}

// Get elements that intersect with a selection rectangle
export function getElementsInRect(
  elements: CanvasElement[],
  rect: { x: number; y: number; width: number; height: number }
): string[] {
  const rectRight = rect.x + rect.width
  const rectBottom = rect.y + rect.height

  return elements
    .filter((element) => {
      const elRight = element.x + element.width
      const elBottom = element.y + element.height

      // Check for intersection
      return (
        element.x < rectRight && elRight > rect.x && element.y < rectBottom && elBottom > rect.y
      )
    })
    .map((el) => el.id)
}

// Calculate bounds for multiple elements
export function calculateBounds(elements: CanvasElement[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of elements) {
    minX = Math.min(minX, el.x)
    minY = Math.min(minY, el.y)
    maxX = Math.max(maxX, el.x + el.width)
    maxY = Math.max(maxY, el.y + el.height)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
