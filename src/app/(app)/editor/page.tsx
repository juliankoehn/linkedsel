'use client'

import { nanoid } from 'nanoid'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

import { AIGenerationOverlay } from '@/components/editor/ai-generation-overlay'
import { AIPanel } from '@/components/editor/ai-panel'
import { KonvaCanvas } from '@/components/editor/konva-canvas'
import { PropertiesPanel } from '@/components/editor/properties-panel'
import { EditorSidebar } from '@/components/editor/sidebar'
import { EditorToolbar } from '@/components/editor/toolbar'
import { type AIGenerationOptions, useAIGeneration } from '@/hooks/use-ai-generation'
import { useToast } from '@/hooks/use-toast'
import { getTemplateById } from '@/lib/templates/default-templates'
import { useCanvasStore } from '@/stores/canvas-store'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import { createTextElement, type Slide, useSlidesStore } from '@/stores/slides-store'

function EditorContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const projectId = searchParams.get('project')

  const { reset: resetProject } = useProjectStore()
  const { setSlides, reset: resetSlides } = useSlidesStore()
  const { reset: resetCanvas } = useCanvasStore()
  const { reset: resetSelection } = useSelectionStore()
  const { reset: resetHistory } = useHistoryStore()

  const [isLoading, setIsLoading] = useState(!!projectId)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const { toast } = useToast()

  // AI Generation hook
  const { state: aiState, generate: generateAI, cancel: cancelAI } = useAIGeneration()

  // Load template and convert to new format
  const loadTemplateToSlides = useCallback(
    (tid: string) => {
      const template = getTemplateById(tid)
      if (!template) return

      const slides: Slide[] = template.slides.map((slideTemplate) => {
        const elements: any[] = []

        for (const element of slideTemplate.elements) {
          if (element.type === 'text') {
            const props = element.props as any
            elements.push(
              createTextElement({
                x: props.left,
                y: props.top,
                width: props.width || 300,
                height: 50,
                text: props.text,
                fontSize: props.fontSize,
                fontFamily: props.fontFamily,
                fontWeight: props.fontWeight || 'normal',
                fill: props.fill,
                textAlign: props.textAlign || 'left',
              })
            )
          } else if (element.type === 'shape') {
            const props = element.props as any
            if (props.shape === 'rect') {
              elements.push({
                id: nanoid(),
                type: 'rect' as const,
                x: props.left,
                y: props.top,
                width: props.width || 100,
                height: props.height || 100,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                fill: props.fill,
                cornerRadius: props.rx || 0,
              })
            } else if (props.shape === 'circle') {
              elements.push({
                id: nanoid(),
                type: 'circle' as const,
                x: props.left,
                y: props.top,
                width: (props.radius || 50) * 2,
                height: (props.radius || 50) * 2,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                fill: props.fill,
                radius: props.radius || 50,
              })
            }
          }
        }

        return {
          id: slideTemplate.id,
          backgroundColor: slideTemplate.backgroundColor,
          elements,
        }
      })

      setSlides(slides)
      useProjectStore.getState().setName(template.name)
      useProjectStore.getState().markDirty()
    },
    [setSlides]
  )

  useEffect(() => {
    const initEditor = async () => {
      if (projectId) {
        setIsLoading(true)
        const result = await useProjectStore.getState().loadProject(projectId)
        if ('error' in result) {
          toast({
            title: 'Error loading project',
            description: result.error,
            variant: 'destructive',
          })
          resetProject()
          resetSlides()
          resetCanvas()
          resetSelection()
          resetHistory()
        } else {
          // Apply loaded data
          if (result.data.format) {
            useCanvasStore.getState().setFormat(result.data.format)
          }
          if (result.data.slides) {
            useSlidesStore.getState().setSlides(result.data.slides)
          }
        }
        setIsLoading(false)
      } else if (templateId) {
        loadTemplateToSlides(templateId)
      } else {
        resetProject()
        resetSlides()
        resetCanvas()
        resetSelection()
        resetHistory()
      }
    }

    initEditor()
  }, [
    templateId,
    projectId,
    toast,
    resetProject,
    resetSlides,
    resetCanvas,
    resetSelection,
    resetHistory,
    loadTemplateToSlides,
  ])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading project...</div>
      </div>
    )
  }

  // Handler for streaming AI generation
  const handleStartAIGeneration = async (options: AIGenerationOptions) => {
    setIsAIPanelOpen(false) // Close panel, overlay takes over
    await generateAI(options)

    if (!aiState.error) {
      toast({
        title: 'AI Generation complete',
        description: `Created ${aiState.totalSlides} slides`,
      })
    }
  }

  return (
    <>
      <div className="relative h-full overflow-hidden">
        {/* Toolbar - fixed at top */}
        <div className="absolute inset-x-0 top-0 z-20 border-b bg-white">
          <EditorToolbar onOpenAIPanel={() => setIsAIPanelOpen(true)} />
        </div>

        {/* Canvas - full area behind sidebars */}
        <div className="absolute inset-0 pt-[105px]">
          <KonvaCanvas />
          {/* AI Generation Overlay - shows on canvas during generation */}
          <AIGenerationOverlay state={aiState} onCancel={cancelAI} />
        </div>

        {/* Left Sidebar - overlay (disabled during AI generation) */}
        <div
          className={`absolute bottom-3 left-3 top-[112px] z-10 ${
            aiState.isGenerating ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <EditorSidebar />
        </div>

        {/* Right Sidebar - overlay (disabled during AI generation) */}
        <div
          className={`absolute right-3 top-[112px] z-10 ${
            aiState.isGenerating ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <PropertiesPanel />
        </div>
      </div>

      <AIPanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        onGenerate={handleStartAIGeneration}
        isGenerating={aiState.isGenerating}
      />
    </>
  )
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-gray-100">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
