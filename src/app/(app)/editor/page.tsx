'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { EditorCanvas } from '@/components/editor/canvas'
import { EditorSidebar } from '@/components/editor/sidebar'
import { EditorToolbar } from '@/components/editor/toolbar'
import { getTemplateById } from '@/lib/templates/default-templates'
import { useEditorStore } from '@/stores/editor'

function EditorContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const loadTemplate = useEditorStore((state) => state.loadTemplate)
  const reset = useEditorStore((state) => state.reset)

  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId)
      if (template) {
        loadTemplate(template)
      }
    } else {
      // Reset to blank canvas if no template
      reset()
    }
  }, [templateId, loadTemplate, reset])

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

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="text-gray-500">Editor wird geladen...</div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
