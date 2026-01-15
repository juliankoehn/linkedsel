'use client'

import { nanoid } from 'nanoid'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

import { AIPanel } from '@/components/editor/ai-panel'
import { KonvaCanvas } from '@/components/editor/konva-canvas'
import { PropertiesPanel } from '@/components/editor/properties-panel'
import { EditorSidebar } from '@/components/editor/sidebar'
import { EditorToolbar } from '@/components/editor/toolbar'
import { useToast } from '@/hooks/use-toast'
import { getTemplateById } from '@/lib/templates/default-templates'
import { useCanvasStore } from '@/stores/canvas-store'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import {
  createTextElement,
  type Slide,
  type TextElement,
  useSlidesStore,
} from '@/stores/slides-store'

interface GeneratedSlide {
  headline: string
  body: string
  callToAction?: string
}

function EditorContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const projectId = searchParams.get('project')

  const { reset: resetProject } = useProjectStore()
  const { setSlides, reset: resetSlides } = useSlidesStore()
  const { getDimensions, reset: resetCanvas } = useCanvasStore()
  const { reset: resetSelection } = useSelectionStore()
  const { reset: resetHistory } = useHistoryStore()

  const [isLoading, setIsLoading] = useState(!!projectId)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const { toast } = useToast()

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
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    )
  }

  const handleApplyAIContent = (aiSlides: GeneratedSlide[]) => {
    const { width, height } = getDimensions()

    const newSlides: Slide[] = aiSlides.map((aiSlide, index) => {
      const elements: TextElement[] = []

      // Headline
      elements.push(
        createTextElement({
          x: 60,
          y: index === 0 ? 120 : 80,
          width: width - 120,
          height: 80,
          text: aiSlide.headline,
          fontSize: index === 0 ? 64 : 56,
          fontWeight: 'bold',
          fill: '#1a1a1a',
        })
      )

      // Body
      elements.push(
        createTextElement({
          x: 60,
          y: index === 0 ? 250 : 200,
          width: width - 120,
          height: 200,
          text: aiSlide.body,
          fontSize: 32,
          fontWeight: 'normal',
          fill: '#4a4a4a',
        })
      )

      // Call to Action
      if (aiSlide.callToAction && index === aiSlides.length - 1) {
        elements.push(
          createTextElement({
            x: 60,
            y: height - 200,
            width: width - 120,
            height: 50,
            text: aiSlide.callToAction,
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#7c3aed',
          })
        )
      }

      // Slide number
      elements.push(
        createTextElement({
          x: width - 100,
          y: height - 80,
          width: 80,
          height: 30,
          text: `${index + 1}/${aiSlides.length}`,
          fontSize: 24,
          fontWeight: 'normal',
          fill: '#9ca3af',
        })
      )

      return {
        id: nanoid(),
        backgroundColor: '#ffffff',
        elements,
      }
    })

    useHistoryStore.getState().pushState(useSlidesStore.getState().slides)
    setSlides(newSlides)
    useProjectStore.getState().markDirty()

    toast({
      title: 'AI Content applied',
      description: `${aiSlides.length} slides have been created.`,
    })
  }

  return (
    <>
      <div className="relative h-[calc(100vh-8rem)] overflow-hidden">
        {/* Toolbar - fixed at top */}
        <div className="absolute inset-x-0 top-0 z-20 border-b bg-white">
          <EditorToolbar onOpenAIPanel={() => setIsAIPanelOpen(true)} />
        </div>

        {/* Canvas - full area behind sidebars */}
        <div className="absolute inset-0 pt-[105px]">
          <KonvaCanvas />
        </div>

        {/* Left Sidebar - overlay */}
        <div className="absolute left-4 top-[120px] z-10">
          <EditorSidebar />
        </div>

        {/* Right Sidebar - overlay */}
        <div className="absolute right-4 top-[120px] z-10">
          <PropertiesPanel />
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
          <div className="text-gray-500">Loading editor...</div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
