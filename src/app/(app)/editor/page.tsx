'use client'

import { EditorCanvas } from '@/components/editor/canvas'
import { EditorSidebar } from '@/components/editor/sidebar'
import { EditorToolbar } from '@/components/editor/toolbar'

export default function EditorPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Sidebar - Slides */}
      <EditorSidebar />

      {/* Main Canvas */}
      <div className="flex flex-1 flex-col rounded-lg border bg-white">
        <EditorToolbar />
        <EditorCanvas />
      </div>
    </div>
  )
}
