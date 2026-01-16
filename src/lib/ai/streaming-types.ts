/**
 * Types for AI streaming generation
 */

import type { BrandKit } from '@/types/brand-kit'

import type { SlideData } from './carousel-schema'
import type { QualityTier } from './pipeline'

// Request types
export interface CarouselGenerationRequest {
  topic: string
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
  slideCount: number
  language: 'de' | 'en'
  quality: QualityTier
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
  | 'step_start'
  | 'step_complete'
  | 'slide_data'
  | 'slide_complete'
  | 'validation_error'
  | 'refinement_start'
  | 'progress'
  | 'error'
  | 'done'

export interface StreamEvent {
  type: StreamEventType
  data: StreamEventData
}

export type StreamEventData =
  | StartEventData
  | StepStartEventData
  | StepCompleteEventData
  | SlideDataEventData
  | SlideCompleteEventData
  | ValidationErrorEventData
  | RefinementStartEventData
  | ProgressEventData
  | ErrorEventData
  | DoneEventData

export interface StartEventData {
  totalSlides: number
  quality: QualityTier
  steps: number
}

export interface StepStartEventData {
  step: 'content' | 'design' | 'layout' | 'validation' | 'refinement' | 'generate'
  message: string
}

export interface StepCompleteEventData {
  step: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

export interface SlideDataEventData {
  slideIndex: number
  slide: SlideData
}

export interface SlideCompleteEventData {
  slideIndex: number
  totalSlides: number
}

export interface ValidationErrorEventData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warnings: any[]
  autoFix: boolean
  maxAttemptsReached?: boolean
}

export interface RefinementStartEventData {
  attempt: number
  maxAttempts: number
  errorCount: number
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
  quality: QualityTier
  validationPassed?: boolean
}
