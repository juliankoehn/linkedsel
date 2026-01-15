'use client'

import type { KonvaEventObject } from 'konva/lib/Node'
import { createElement, useEffect, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Group, Path, Rect } from 'react-konva'

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

// Cache for icon paths
const pathCache = new Map<string, string[]>()

// Extract SVG path data from a Lucide icon component
function extractPathsFromComponent(IconComponent: React.ComponentType<any>): string[] {
  const svgMarkup = renderToStaticMarkup(createElement(IconComponent, { size: 24 }))
  const pathMatches = svgMarkup.matchAll(/d="([^"]+)"/g)
  const paths: string[] = []
  for (const match of pathMatches) {
    if (match[1]) {
      paths.push(match[1])
    }
  }
  return paths
}

export function IconElement({
  element,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: IconElementProps) {
  const [paths, setPaths] = useState<string[]>(() => pathCache.get(element.iconName) || [])
  const scale = element.width / 24 // Lucide icons are 24x24

  // Load icon paths dynamically
  useEffect(() => {
    if (paths.length > 0) return

    const loadPaths = async () => {
      // Check cache first
      if (pathCache.has(element.iconName)) {
        setPaths(pathCache.get(element.iconName)!)
        return
      }

      try {
        const module = await import('lucide-react')
        const IconComponent = (module as any)[element.iconName]
        if (IconComponent && typeof IconComponent === 'function') {
          const extractedPaths = extractPathsFromComponent(IconComponent)
          pathCache.set(element.iconName, extractedPaths)
          setPaths(extractedPaths)
        }
      } catch {
        // Icon not found
      }
    }

    loadPaths()
  }, [element.iconName, paths.length])

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
      {/* Render icon paths */}
      {paths.map((pathData, index) => (
        <Path
          key={index}
          data={pathData}
          fill="transparent"
          stroke={element.fill}
          strokeWidth={element.strokeWidth || 2}
          scaleX={scale}
          scaleY={scale}
        />
      ))}
    </Group>
  )
}
