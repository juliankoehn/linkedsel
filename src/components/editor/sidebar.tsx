'use client'

import { LayerPanel } from '@/components/editor/layer-panel'

export function EditorSidebar() {
  return (
    <aside className="flex h-full w-44 flex-col">
      {/* Layers Panel */}
      <div className="min-h-0 flex-1 rounded-lg border bg-white/95 shadow-lg backdrop-blur">
        <LayerPanel />
      </div>
    </aside>
  )
}
