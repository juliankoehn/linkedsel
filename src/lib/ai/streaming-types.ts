/**
 * Types for AI streaming generation
 */

import type { BrandKit } from '@/types/brand-kit'

import type { ToolArgs, ToolName } from './canvas-tools'

// Request types
export interface CarouselGenerationRequest {
  topic: string
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
  slideCount: number
  language: 'de' | 'en'
  brandKit?: BrandKit | null
  existingSlides?: ExistingSlideContext[]
  canvasWidth: number
  canvasHeight: number
}

export interface ExistingSlideContext {
  backgroundColor: string
  hasText: boolean
  hasShapes: boolean
  primaryColors: string[]
}

// SSE Event types
export type StreamEventType =
  | 'start'
  | 'tool_call'
  | 'slide_complete'
  | 'progress'
  | 'error'
  | 'done'

export interface StreamEvent {
  type: StreamEventType
  data: StreamEventData
}

export type StreamEventData =
  | StartEventData
  | ToolCallEventData
  | SlideCompleteEventData
  | ProgressEventData
  | ErrorEventData
  | DoneEventData

export interface StartEventData {
  totalSlides: number
}

export interface ToolCallEventData {
  tool: ToolName
  args: ToolArgs
}

export interface SlideCompleteEventData {
  slideIndex: number
  totalSlides: number
}

export interface ProgressEventData {
  message: string
  slideIndex: number
  totalSlides: number
}

export interface ErrorEventData {
  message: string
}

export interface DoneEventData {
  slidesCreated: number
}

// Pending slide state (client-side)
export interface PendingSlide {
  backgroundColor: string
  elements: PendingElement[]
}

export interface PendingElement {
  type: 'text' | 'rect' | 'circle'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
}
