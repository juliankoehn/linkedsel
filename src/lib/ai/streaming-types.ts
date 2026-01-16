/**
 * Types for AI streaming generation
 */

import type { BrandKit } from '@/types/brand-kit'

import type { SlideData } from './carousel-schema'

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
  | 'slide_data'
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
  | SlideDataEventData
  | SlideCompleteEventData
  | ProgressEventData
  | ErrorEventData
  | DoneEventData

export interface StartEventData {
  totalSlides: number
}

export interface SlideDataEventData {
  slideIndex: number
  slide: SlideData
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
