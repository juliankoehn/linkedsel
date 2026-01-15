'use client'

import { Line } from 'react-konva'

import { useCanvasStore } from '@/stores/canvas-store'

interface SnapLinesProps {
  stageWidth: number
  stageHeight: number
}

export function SnapLines({ stageWidth, stageHeight }: SnapLinesProps) {
  const guidelines = useCanvasStore((state) => state.guidelines)

  if (guidelines.length === 0) return null

  return (
    <>
      {guidelines.map((guide, index) => (
        <Line
          key={`${guide.type}-${guide.position}-${index}`}
          points={
            guide.type === 'vertical'
              ? [guide.position, 0, guide.position, stageHeight]
              : [0, guide.position, stageWidth, guide.position]
          }
          stroke="#0066ff"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      ))}
    </>
  )
}
