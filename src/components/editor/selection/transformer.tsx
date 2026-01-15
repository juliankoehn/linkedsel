'use client'

import type Konva from 'konva'
import { useEffect, useRef } from 'react'
import { Transformer as KonvaTransformer } from 'react-konva'

interface SelectionTransformerProps {
  stageRef: React.RefObject<Konva.Stage | null>
  selectedIds: string[]
  onTransformEnd: (
    updates: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
      rotation: number
      scaleX: number
      scaleY: number
    }>
  ) => void
}

export function SelectionTransformer({
  stageRef,
  selectedIds,
  onTransformEnd,
}: SelectionTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null)

  // Attach transformer to selected nodes
  useEffect(() => {
    const transformer = transformerRef.current
    const stage = stageRef.current

    if (!transformer || !stage) return

    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => node !== undefined)

    transformer.nodes(nodes)
    transformer.getLayer()?.batchDraw()
  }, [selectedIds, stageRef])

  if (selectedIds.length === 0) return null

  return (
    <KonvaTransformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Constrain minimum size
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
          return oldBox
        }
        return newBox
      }}
      onTransformEnd={() => {
        const transformer = transformerRef.current
        if (!transformer) return

        const nodes = transformer.nodes()
        const updates = nodes.map((node) => {
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // Reset scale and apply to width/height
          node.scaleX(1)
          node.scaleY(1)

          return {
            id: node.id(),
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1,
          }
        })

        onTransformEnd(updates)
      }}
      rotateEnabled={true}
      enabledAnchors={[
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ]}
      anchorSize={8}
      anchorCornerRadius={2}
      borderStroke="#0066ff"
      anchorStroke="#0066ff"
      anchorFill="#ffffff"
    />
  )
}
