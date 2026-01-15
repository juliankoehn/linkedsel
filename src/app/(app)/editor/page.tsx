'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { AIPanel } from '@/components/editor/ai-panel'
import { EditorCanvas } from '@/components/editor/canvas'
import { EditorSidebar } from '@/components/editor/sidebar'
import { EditorToolbar } from '@/components/editor/toolbar'
import { useToast } from '@/hooks/use-toast'
import { getTemplateById } from '@/lib/templates/default-templates'
import { useEditorStore } from '@/stores/editor'

interface GeneratedSlide {
  headline: string
  body: string
  callToAction?: string
}

function EditorContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const projectId = searchParams.get('project')
  const loadTemplate = useEditorStore((state) => state.loadTemplate)
  const loadProject = useEditorStore((state) => state.loadProject)
  const applyAIContent = useEditorStore((state) => state.applyAIContent)
  const reset = useEditorStore((state) => state.reset)
  const [isLoading, setIsLoading] = useState(!!projectId)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initEditor = async () => {
      if (projectId) {
        setIsLoading(true)
        const result = await loadProject(projectId)
        if ('error' in result) {
          toast({
            title: 'Fehler beim Laden',
            description: result.error,
            variant: 'destructive',
          })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, projectId, loadProject, loadTemplate, reset, toast])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-gray-500">Projekt wird geladen...</div>
      </div>
    )
  }

  const handleApplyAIContent = (slides: GeneratedSlide[]) => {
    applyAIContent(slides)
    toast({
      title: 'AI Content angewendet',
      description: `${slides.length} Slides wurden erstellt.`,
    })
  }

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        <EditorSidebar />
        <div className="flex flex-1 flex-col rounded-lg border bg-white">
          <EditorToolbar onOpenAIPanel={() => setIsAIPanelOpen(true)} />
          <EditorCanvas />
        </div>
      </div>

      <AIPanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        onApply={handleApplyAIContent}
      />
    </>
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
