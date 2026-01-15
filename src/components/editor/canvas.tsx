'use client'

import { useEffect, useRef } from 'react'

import { useEditorStore } from '@/stores/editor'

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { initCanvas } = useEditorStore()

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      initCanvas(canvasRef.current)
    }
  }, [initCanvas])

  return (
    <div
      ref={containerRef}
      className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-8"
    >
      <div className="rounded-lg bg-white shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
