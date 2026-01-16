'use client'

import { nanoid } from 'nanoid'
import { useCallback, useRef, useState } from 'react'

import type { ElementData, SlideData } from '@/lib/ai/carousel-schema'
import type {
  CarouselGenerationRequest,
  DoneEventData,
  ErrorEventData,
  ProgressEventData,
  SlideCompleteEventData,
  SlideDataEventData,
  StartEventData,
  StreamEvent,
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

  const { slides, setSlides } = useSlidesStore()
  const { getDimensions } = useCanvasStore()
  const { pushState } = useHistoryStore()
  const { markDirty } = useProjectStore()

  // Convert AI-generated slide data to our Slide format
  const convertSlideDataToSlide = useCallback((slideData: SlideData): Slide => {
    const elements: CanvasElement[] = slideData.elements.map((el: ElementData) => {
      switch (el.type) {
        case 'text':
          return createTextElement({
            id: nanoid(),
            text: el.text,
            x: el.x,
            y: el.y,
            width: el.width,
            height: 100, // Will auto-adjust
            fontSize: el.fontSize,
            fontWeight: el.fontWeight || 'normal',
            fontFamily: 'Inter',
            fill: el.color,
            textAlign: el.textAlign || 'left',
          })
        case 'rectangle':
          return createRectElement({
            id: nanoid(),
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            fill: el.fill,
            cornerRadius: el.cornerRadius || 0,
            opacity: el.opacity ?? 1,
          })
        case 'circle':
          return createCircleElement({
            id: nanoid(),
            x: el.x - el.radius, // Center to top-left
            y: el.y - el.radius,
            width: el.radius * 2,
            height: el.radius * 2,
            radius: el.radius,
            fill: el.fill,
            opacity: el.opacity ?? 1,
          })
        default:
          throw new Error(`Unknown element type`)
      }
    })

    return {
      id: nanoid(),
      backgroundColor: slideData.backgroundColor,
      elements,
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

                  case 'slide_data': {
                    const data = event.data as SlideDataEventData
                    const newSlide = convertSlideDataToSlide(data.slide)
                    completedSlides.push(newSlide)

                    // Replace slides with generated ones (don't append)
                    setSlides([...completedSlides])
                    markDirty()
                    break
                  }

                  case 'slide_complete': {
                    const data = event.data as SlideCompleteEventData
                    setState((prev) => ({
                      ...prev,
                      currentSlide: data.slideIndex,
                      message: `Slide ${data.slideIndex} of ${data.totalSlides} complete`,
                    }))
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
    [slides, getDimensions, pushState, convertSlideDataToSlide, setSlides, markDirty]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
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
