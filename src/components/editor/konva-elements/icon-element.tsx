'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { createElement, useEffect, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Circle, Group, Line, Path, Rect } from 'react-konva'

import type { IconElement as IconElementType } from '@/stores/slides-store'

interface IconElementProps {
  element: IconElementType
  isSelected: boolean
  onSelect: (id: string, e: KonvaEventObject<MouseEvent>) => void
  onDragStart: (id: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onTransformEnd: (id: string, updates: Partial<IconElementType>) => void
}

// Parsed SVG element types
type SvgElement =
  | { type: 'path'; d: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number }
  | { type: 'polyline'; points: number[] }
  | { type: 'polygon'; points: number[] }

// Cache for parsed SVG elements
const elementCache = new Map<string, SvgElement[]>()

// Extract all SVG elements from a Lucide icon component
function extractSvgElements(IconComponent: React.ComponentType<any>): SvgElement[] {
  const svgMarkup = renderToStaticMarkup(createElement(IconComponent, { size: 24 }))
  const elements: SvgElement[] = []

  // Extract path elements
  const pathMatches = svgMarkup.matchAll(/<path[^>]*d="([^"]+)"[^>]*\/?>/g)
  for (const match of pathMatches) {
    if (match[1]) {
      elements.push({ type: 'path', d: match[1] })
    }
  }

  // Extract line elements
  const lineMatches = svgMarkup.matchAll(
    /<line[^>]*x1="([^"]+)"[^>]*y1="([^"]+)"[^>]*x2="([^"]+)"[^>]*y2="([^"]+)"[^>]*\/?>/g
  )
  for (const match of lineMatches) {
    elements.push({
      type: 'line',
      x1: parseFloat(match[1] || '0'),
      y1: parseFloat(match[2] || '0'),
      x2: parseFloat(match[3] || '0'),
      y2: parseFloat(match[4] || '0'),
    })
  }

  // Extract circle elements
  const circleMatches = svgMarkup.matchAll(
    /<circle[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*r="([^"]+)"[^>]*\/?>/g
  )
  for (const match of circleMatches) {
    elements.push({
      type: 'circle',
      cx: parseFloat(match[1] || '0'),
      cy: parseFloat(match[2] || '0'),
      r: parseFloat(match[3] || '0'),
    })
  }

  // Extract polyline elements
  const polylineMatches = svgMarkup.matchAll(/<polyline[^>]*points="([^"]+)"[^>]*\/?>/g)
  for (const match of polylineMatches) {
    if (match[1]) {
      const points = match[1]
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n))
      elements.push({ type: 'polyline', points })
    }
  }

  // Extract polygon elements
  const polygonMatches = svgMarkup.matchAll(/<polygon[^>]*points="([^"]+)"[^>]*\/?>/g)
  for (const match of polygonMatches) {
    if (match[1]) {
      const points = match[1]
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n))
      elements.push({ type: 'polygon', points })
    }
  }

  return elements
}

export function IconElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: IconElementProps) {
  const [svgElements, setSvgElements] = useState<SvgElement[]>(
    () => elementCache.get(element.iconName) || []
  )
  const scale = element.width / 24 // Lucide icons are 24x24
  const strokeColor = element.fill || '#000000'
  const strokeWidth = element.strokeWidth || 2

  // Load SVG elements dynamically
  useEffect(() => {
    if (svgElements.length > 0) return

    const loadElements = async () => {
      // Check cache first
      if (elementCache.has(element.iconName)) {
        setSvgElements(elementCache.get(element.iconName)!)
        return
      }

      try {
        const module = await import('lucide-react')
        const IconComponent = (module as any)[element.iconName]
        if (IconComponent && typeof IconComponent === 'function') {
          const extracted = extractSvgElements(IconComponent)
          elementCache.set(element.iconName, extracted)
          setSvgElements(extracted)
        }
      } catch {
        // Icon not found
      }
    }

    loadElements()
  }, [element.iconName, svgElements.length])

  // Common stroke props
  const strokeProps = {
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  }

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
    >
      {/* Invisible rect for easier selection */}
      <Rect width={element.width} height={element.height} fill="transparent" />

      {/* Render SVG elements */}
      {svgElements.map((svgEl, index) => {
        switch (svgEl.type) {
          case 'path':
            return (
              <Path
                key={index}
                data={svgEl.d}
                fill="transparent"
                scaleX={scale}
                scaleY={scale}
                {...strokeProps}
              />
            )
          case 'line':
            return (
              <Line
                key={index}
                points={[svgEl.x1 * scale, svgEl.y1 * scale, svgEl.x2 * scale, svgEl.y2 * scale]}
                {...strokeProps}
              />
            )
          case 'circle':
            return (
              <Circle
                key={index}
                x={svgEl.cx * scale}
                y={svgEl.cy * scale}
                radius={svgEl.r * scale}
                fill="transparent"
                {...strokeProps}
              />
            )
          case 'polyline':
            return <Line key={index} points={svgEl.points.map((p) => p * scale)} {...strokeProps} />
          case 'polygon':
            return (
              <Line
                key={index}
                points={svgEl.points.map((p) => p * scale)}
                closed
                fill="transparent"
                {...strokeProps}
              />
            )
          default:
            return null
        }
      })}
    </Group>
  )
}
