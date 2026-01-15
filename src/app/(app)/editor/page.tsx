'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { EditorCanvas } from '@/components/editor/canvas'
import { EditorSidebar } from '@/components/editor/sidebar'
import { EditorToolbar } from '@/components/editor/toolbar'
import { getTemplateById } from '@/lib/templates/default-templates'
import { useEditorStore } from '@/stores/editor'

function EditorContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const projectId = searchParams.get('project')
  const loadTemplate = useEditorStore((state) => state.loadTemplate)
  const loadProject = useEditorStore((state) => state.loadProject)
  const reset = useEditorStore((state) => state.reset)
  const [isLoading, setIsLoading] = useState(!!projectId)

  useEffect(() => {
    const initEditor = async () => {
      if (projectId) {
        setIsLoading(true)
        const success = await loadProject(projectId)
        if (!success) {
          // If project load fails, reset to blank
          reset()
        }
        setIsLoading(false)
      } else if (templateId) {
        const template = getTemplateById(templateId)
        if (template) {
          loadTemplate(template)
        }
      } else {
        reset()
      }
    }

    initEditor()
  }, [templateId, projectId, loadTemplate, loadProject, reset])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-gray-500">Projekt wird geladen...</div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <EditorSidebar />
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
