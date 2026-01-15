import type Konva from 'konva'
import type { RefObject } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Format presets for different social media platforms
export const FORMAT_PRESETS = {
  'linkedin-portrait': {
    name: 'LinkedIn Portrait',
    width: 1080,
    height: 1350,
    ratio: '4:5',
  },
  'linkedin-square': {
    name: 'LinkedIn Square',
    width: 1080,
    height: 1080,
    ratio: '1:1',
  },
  'instagram-portrait': {
    name: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    ratio: '4:5',
  },
  'instagram-square': {
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    ratio: '1:1',
  },
  'instagram-story': {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    ratio: '9:16',
  },
  'twitter-post': {
    name: 'Twitter Post',
    width: 1200,
    height: 675,
    ratio: '16:9',
  },
  'facebook-post': {
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    ratio: '1.91:1',
  },
} as const

export type FormatPreset = keyof typeof FORMAT_PRESETS

export interface Guideline {
  type: 'vertical' | 'horizontal'
  position: number
}

interface CanvasState {
  stageRef: RefObject<Konva.Stage | null> | null
  format: FormatPreset
  zoom: number
  pan: { x: number; y: number }
  gridEnabled: boolean
  snapEnabled: boolean
  guidelines: Guideline[]
}

interface CanvasActions {
  setStageRef: (ref: RefObject<Konva.Stage | null>) => void
  setFormat: (format: FormatPreset) => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  toggleGrid: () => void
  toggleSnap: () => void
  setGuidelines: (guidelines: Guideline[]) => void
  clearGuidelines: () => void
  getDimensions: () => { width: number; height: number }
  reset: () => void
}

type CanvasStore = CanvasState & CanvasActions

const DISPLAY_SCALE = 0.4
const DEFAULT_ZOOM = 0.95

const initialState: CanvasState = {
  stageRef: null,
  format: 'linkedin-portrait',
  zoom: DEFAULT_ZOOM,
  pan: { x: 0, y: 0 },
  gridEnabled: false,
  snapEnabled: true,
  guidelines: [],
}

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setStageRef: (ref) => set({ stageRef: ref }),

      setFormat: (format) => set({ format }),

      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),

      setPan: (pan) => set({ pan }),

      toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

      toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),

      setGuidelines: (guidelines) => set({ guidelines }),

      clearGuidelines: () => set({ guidelines: [] }),

      getDimensions: () => {
        const { format } = get()
        const preset = FORMAT_PRESETS[format]
        return { width: preset.width, height: preset.height }
      },

      reset: () => set(initialState),
    }),
    { name: 'canvas-store' }
  )
)

export const DISPLAY_SCALE_FACTOR = DISPLAY_SCALE
