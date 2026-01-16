/**
 * Overlap Detection for Canvas Elements
 * Detects and reports overlapping elements
 */

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface OverlapResult {
  overlaps: boolean
  overlapArea: number
  overlapPercent: number
}

/**
 * Get bounding box for an element
 */
export function getElementBounds(element: {
  type: string
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
}): BoundingBox {
  if (element.type === 'circle' && element.radius) {
    // Circle uses center coordinates
    return {
      x: element.x - element.radius,
      y: element.y - element.radius,
      width: element.radius * 2,
      height: element.radius * 2,
    }
  }

  // Text and rectangle use top-left coordinates
  return {
    x: element.x,
    y: element.y,
    width: element.width || 0,
    height: element.height || 0,
  }
}

/**
 * Check if two bounding boxes overlap
 */
export function checkOverlap(box1: BoundingBox, box2: BoundingBox): OverlapResult {
  // Calculate overlap region
  const xOverlap = Math.max(
    0,
    Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x)
  )
  const yOverlap = Math.max(
    0,
    Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y)
  )

  const overlapArea = xOverlap * yOverlap
  const smallerArea = Math.min(box1.width * box1.height, box2.width * box2.height)
  const overlapPercent = smallerArea > 0 ? (overlapArea / smallerArea) * 100 : 0

  return {
    overlaps: overlapArea > 0,
    overlapArea,
    overlapPercent,
  }
}

/**
 * Estimate text element height based on content and font size
 * This is a rough estimate - actual height depends on font metrics
 */
export function estimateTextHeight(
  text: string,
  width: number,
  fontSize: number,
  lineHeight: number = 1.2
): number {
  // Approximate characters per line based on average character width
  const avgCharWidth = fontSize * 0.5
  const charsPerLine = Math.floor(width / avgCharWidth)

  if (charsPerLine <= 0) return fontSize * lineHeight

  // Estimate number of lines
  const lines = Math.ceil(text.length / charsPerLine)

  return lines * fontSize * lineHeight
}

/**
 * Find all overlapping text elements in a list
 * Returns pairs of overlapping element indices
 */
export function findTextOverlaps(
  elements: Array<{
    type: string
    text?: string
    x: number
    y: number
    width?: number
    height?: number
    fontSize?: number
    radius?: number
  }>,
  minOverlapPercent: number = 10
): Array<{ index1: number; index2: number; overlapPercent: number }> {
  const overlaps: Array<{ index1: number; index2: number; overlapPercent: number }> = []

  // Get text elements only for overlap detection
  const textElements = elements
    .map((el, index) => ({ el, index }))
    .filter(({ el }) => el.type === 'text')

  for (let i = 0; i < textElements.length; i++) {
    for (let j = i + 1; j < textElements.length; j++) {
      const item1 = textElements[i]
      const item2 = textElements[j]
      if (!item1 || !item2) continue

      const el1 = item1.el
      const el2 = item2.el

      // Estimate heights if not provided
      const height1 =
        el1.height || estimateTextHeight(el1.text || '', el1.width || 400, el1.fontSize || 24)
      const height2 =
        el2.height || estimateTextHeight(el2.text || '', el2.width || 400, el2.fontSize || 24)

      const box1: BoundingBox = {
        x: el1.x,
        y: el1.y,
        width: el1.width || 400,
        height: height1,
      }

      const box2: BoundingBox = {
        x: el2.x,
        y: el2.y,
        width: el2.width || 400,
        height: height2,
      }

      const result = checkOverlap(box1, box2)

      if (result.overlaps && result.overlapPercent >= minOverlapPercent) {
        overlaps.push({
          index1: item1.index,
          index2: item2.index,
          overlapPercent: result.overlapPercent,
        })
      }
    }
  }

  return overlaps
}

/**
 * Check if an element is within canvas bounds
 */
export function isWithinBounds(
  element: {
    type: string
    x: number
    y: number
    width?: number
    height?: number
    radius?: number
  },
  canvasWidth: number,
  canvasHeight: number
): { withinBounds: boolean; violations: string[] } {
  const bounds = getElementBounds(element)
  const violations: string[] = []

  if (bounds.x < 0) violations.push('x is negative')
  if (bounds.y < 0) violations.push('y is negative')
  if (bounds.x + bounds.width > canvasWidth) violations.push('exceeds canvas width')
  if (bounds.y + bounds.height > canvasHeight) violations.push('exceeds canvas height')

  return {
    withinBounds: violations.length === 0,
    violations,
  }
}
