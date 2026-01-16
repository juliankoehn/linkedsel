'use client'

import { nanoid } from 'nanoid'
import { useCallback, useRef, useState } from 'react'

import type {
  AddCircleArgs,
  AddRectangleArgs,
  AddTextArgs,
  CreateSlideArgs,
  ToolName,
} from '@/lib/ai/canvas-tools'
import type {
  CarouselGenerationRequest,
  DoneEventData,
  ErrorEventData,
  PendingSlide,
  ProgressEventData,
  SlideCompleteEventData,
  StartEventData,
  StreamEvent,
  ToolCallEventData,
} from '@/lib/ai/streaming-types'
import { useCanvasStore } from '@/stores/canvas-store'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import {
  type CanvasElement,
  createCircleElement,
  createRectElement,
  createTextElement,
  type Slide,
  useSlidesStore,
} from '@/stores/slides-store'
import type { BrandKit } from '@/types/brand-kit'

export interface AIGenerationState {
  isGenerating: boolean
  currentSlide: number
  totalSlides: number
  message: string
  error: string | null
}

export interface AIGenerationOptions {
  topic: string
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
  slideCount: number
  language: 'de' | 'en'
  brandKit?: BrandKit | null
}

export function useAIGeneration() {
  const [state, setState] = useState<AIGenerationState>({
    isGenerating: false,
    currentSlide: 0,
    totalSlides: 0,
    message: '',
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const pendingSlideRef = useRef<PendingSlide | null>(null)

  const { slides, setSlides } = useSlidesStore()
  const { getDimensions } = useCanvasStore()
  const { pushState } = useHistoryStore()
  const { markDirty } = useProjectStore()

  const convertPendingToSlide = useCallback((pending: PendingSlide): Slide => {
    const elements: CanvasElement[] = pending.elements.map((el) => {
      switch (el.type) {
        case 'text': {
          const props = el.props as unknown as AddTextArgs
          return createTextElement({
            id: nanoid(),
            text: props.text,
            x: props.x,
            y: props.y,
            width: props.width || 400,
            height: 100,
            fontSize: props.fontSize,
            fontWeight: props.fontWeight || 'normal',
            fontFamily: props.fontFamily || 'Inter',
            fill: props.color,
            textAlign: props.textAlign || 'left',
          })
        }
        case 'rect': {
          const props = el.props as unknown as AddRectangleArgs
          return createRectElement({
            id: nanoid(),
            x: props.x,
            y: props.y,
            width: props.width,
            height: props.height,
            fill: props.fill,
            cornerRadius: props.cornerRadius || 0,
            opacity: props.opacity ?? 1,
          })
        }
        case 'circle': {
          const props = el.props as unknown as AddCircleArgs
          return createCircleElement({
            id: nanoid(),
            x: props.x,
            y: props.y,
            width: props.radius * 2,
            height: props.radius * 2,
            radius: props.radius,
            fill: props.fill,
            opacity: props.opacity ?? 1,
          })
        }
        default:
          throw new Error(`Unknown element type: ${el.type}`)
      }
    })

    return {
      id: nanoid(),
      backgroundColor: pending.backgroundColor,
      elements,
    }
  }, [])

  const processToolCall = useCallback((tool: ToolName, args: unknown) => {
    switch (tool) {
      case 'create_slide': {
        const { backgroundColor } = args as CreateSlideArgs
        pendingSlideRef.current = {
          backgroundColor,
          elements: [],
        }
        break
      }
      case 'add_text': {
        if (pendingSlideRef.current) {
          const textArgs = args as AddTextArgs
          pendingSlideRef.current.elements.push({
            type: 'text',
            props: textArgs,
          })
        }
        break
      }
      case 'add_rectangle': {
        if (pendingSlideRef.current) {
          const rectArgs = args as AddRectangleArgs
          pendingSlideRef.current.elements.push({
            type: 'rect',
            props: rectArgs,
          })
        }
        break
      }
      case 'add_circle': {
        if (pendingSlideRef.current) {
          const circleArgs = args as AddCircleArgs
          pendingSlideRef.current.elements.push({
            type: 'circle',
            props: circleArgs,
          })
        }
        break
      }
      case 'complete_slide': {
        // Slide completion is handled in the stream processing
        break
      }
    }
  }, [])

  const generate = useCallback(
    async (options: AIGenerationOptions) => {
      // Save current state for undo
      pushState(slides)

      // Reset state
      setState({
        isGenerating: true,
        currentSlide: 0,
        totalSlides: options.slideCount,
        message: 'Starting generation...',
        error: null,
      })

      pendingSlideRef.current = null
      abortControllerRef.current = new AbortController()

      const { width, height } = getDimensions()
      const completedSlides: Slide[] = []

      // Build existing slides context
      const existingSlides = slides.map((slide) => ({
        backgroundColor: slide.backgroundColor,
        hasText: slide.elements.some((el) => el.type === 'text'),
        hasShapes: slide.elements.some((el) =>
          ['rect', 'circle', 'triangle', 'polygon'].includes(el.type)
        ),
        primaryColors: slide.elements
          .filter((el) => 'fill' in el && el.fill)
          .map((el) => (el as { fill: string }).fill)
          .slice(0, 3),
      }))

      const requestBody: CarouselGenerationRequest = {
        topic: options.topic,
        style: options.style,
        slideCount: options.slideCount,
        language: options.language,
        brandKit: options.brandKit,
        existingSlides: existingSlides.length > 0 ? existingSlides : undefined,
        canvasWidth: width,
        canvasHeight: height,
      }

      try {
        const response = await fetch('/api/ai/generate-carousel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Generation failed')
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response stream')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6)
              try {
                const event: StreamEvent = JSON.parse(jsonStr)

                switch (event.type) {
                  case 'start': {
                    const data = event.data as StartEventData
                    setState((prev) => ({
                      ...prev,
                      totalSlides: data.totalSlides,
                      message: 'Starting generation...',
                    }))
                    break
                  }

                  case 'progress': {
                    const data = event.data as ProgressEventData
                    setState((prev) => ({
                      ...prev,
                      currentSlide: data.slideIndex,
                      message: data.message,
                    }))
                    break
                  }

                  case 'tool_call': {
                    const data = event.data as ToolCallEventData
                    processToolCall(data.tool, data.args)
                    break
                  }

                  case 'slide_complete': {
                    const data = event.data as SlideCompleteEventData
                    if (pendingSlideRef.current) {
                      const newSlide = convertPendingToSlide(pendingSlideRef.current)
                      completedSlides.push(newSlide)
                      pendingSlideRef.current = null

                      // Replace slides with generated ones (don't append)
                      setSlides(completedSlides)
                      markDirty()

                      setState((prev) => ({
                        ...prev,
                        currentSlide: data.slideIndex,
                        message: `Slide ${data.slideIndex} of ${data.totalSlides} complete`,
                      }))
                    }
                    break
                  }

                  case 'error': {
                    const data = event.data as ErrorEventData
                    setState((prev) => ({
                      ...prev,
                      error: data.message,
                      isGenerating: false,
                    }))
                    break
                  }

                  case 'done': {
                    const data = event.data as DoneEventData
                    setState((prev) => ({
                      ...prev,
                      isGenerating: false,
                      message: `Created ${data.slidesCreated} slides`,
                    }))
                    break
                  }
                }
              } catch {
                console.error('Failed to parse SSE event:', jsonStr)
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            message: 'Generation cancelled',
          }))
        } else {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            error: error instanceof Error ? error.message : 'Generation failed',
          }))
        }
      }
    },
    [slides, getDimensions, pushState, processToolCall, convertPendingToSlide, setSlides, markDirty]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    pendingSlideRef.current = null
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      message: 'Generation cancelled',
    }))
  }, [])

  return {
    state,
    generate,
    cancel,
  }
}
