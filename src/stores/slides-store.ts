import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

// Element types
export type ElementType = 'text' | 'image' | 'rect' | 'circle' | 'line' | 'group'

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  name?: string
}

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right'
  fill: string
  stroke?: string
  strokeWidth?: number
  lineHeight?: number
  letterSpacing?: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  filters?: string[]
  brightness?: number
  contrast?: number
  saturation?: number
}

export interface RectElement extends BaseElement {
  type: 'rect'
  fill: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
}

export interface CircleElement extends BaseElement {
  type: 'circle'
  fill: string
  stroke?: string
  strokeWidth?: number
  radius: number
}

export interface LineElement extends BaseElement {
  type: 'line'
  points: number[]
  stroke: string
  strokeWidth: number
}

export interface GroupElement extends BaseElement {
  type: 'group'
  children: CanvasElement[]
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | RectElement
  | CircleElement
  | LineElement
  | GroupElement

export interface Slide {
  id: string
  backgroundColor: string
  elements: CanvasElement[]
}

interface SlidesState {
  slides: Slide[]
  currentSlideIndex: number
}

interface SlidesActions {
  // Slide operations
  addSlide: () => void
  deleteSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  setCurrentSlide: (index: number) => void
  setSlideBackground: (index: number, color: string) => void

  // Element CRUD
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => CanvasElement | null
  deleteElements: (ids: string[]) => void

  // Bulk operations
  updateElements: (updates: Array<{ id: string; changes: Partial<CanvasElement> }>) => void

  // Z-ordering
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void

  // Helpers
  getElementById: (id: string) => CanvasElement | undefined
  getCurrentSlide: () => Slide | undefined
  setSlides: (slides: Slide[]) => void

  reset: () => void
}

type SlidesStore = SlidesState & SlidesActions

const createEmptySlide = (): Slide => ({
  id: nanoid(),
  backgroundColor: '#ffffff',
  elements: [],
})

const initialState: SlidesState = {
  slides: [createEmptySlide()],
  currentSlideIndex: 0,
}

export const useSlidesStore = create<SlidesStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Slide operations
      addSlide: () => {
        set((state) => ({
          slides: [...state.slides, createEmptySlide()],
          currentSlideIndex: state.slides.length,
        }))
      },

      deleteSlide: (index) => {
        const { slides } = get()
        if (slides.length <= 1) return

        set((state) => {
          const newSlides = state.slides.filter((_, i) => i !== index)
          const newIndex = Math.min(state.currentSlideIndex, newSlides.length - 1)
          return { slides: newSlides, currentSlideIndex: newIndex }
        })
      },

      duplicateSlide: (index) => {
        const { slides } = get()
        const slideToDuplicate = slides[index]
        if (!slideToDuplicate) return

        const duplicatedSlide: Slide = {
          id: nanoid(),
          backgroundColor: slideToDuplicate.backgroundColor,
          elements: slideToDuplicate.elements.map((el) => ({
            ...el,
            id: nanoid(),
          })),
        }

        set((state) => {
          const newSlides = [...state.slides]
          newSlides.splice(index + 1, 0, duplicatedSlide)
          return { slides: newSlides, currentSlideIndex: index + 1 }
        })
      },

      reorderSlides: (fromIndex, toIndex) => {
        set((state) => {
          const newSlides = [...state.slides]
          const [removed] = newSlides.splice(fromIndex, 1)
          if (removed) {
            newSlides.splice(toIndex, 0, removed)
          }
          return { slides: newSlides }
        })
      },

      setCurrentSlide: (index) => {
        const { slides } = get()
        if (index >= 0 && index < slides.length) {
          set({ currentSlideIndex: index })
        }
      },

      setSlideBackground: (index, color) => {
        set((state) => {
          const newSlides = [...state.slides]
          const slide = newSlides[index]
          if (slide) {
            slide.backgroundColor = color
          }
          return { slides: newSlides }
        })
      },

      // Element operations
      addElement: (element) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            currentSlide.elements = [...currentSlide.elements, element]
          }
          return { slides: newSlides }
        })
      },

      updateElement: (id, updates) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            currentSlide.elements = currentSlide.elements.map((el) =>
              el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
            )
          }
          return { slides: newSlides }
        })
      },

      deleteElement: (id) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            currentSlide.elements = currentSlide.elements.filter((el) => el.id !== id)
          }
          return { slides: newSlides }
        })
      },

      duplicateElement: (id) => {
        const { slides, currentSlideIndex } = get()
        const currentSlide = slides[currentSlideIndex]
        if (!currentSlide) return null

        const element = currentSlide.elements.find((el) => el.id === id)
        if (!element) return null

        const duplicated: CanvasElement = {
          ...element,
          id: nanoid(),
          x: element.x + 20,
          y: element.y + 20,
        }

        set((state) => {
          const newSlides = [...state.slides]
          const slide = newSlides[state.currentSlideIndex]
          if (slide) {
            slide.elements = [...slide.elements, duplicated]
          }
          return { slides: newSlides }
        })

        return duplicated
      },

      deleteElements: (ids) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            currentSlide.elements = currentSlide.elements.filter((el) => !ids.includes(el.id))
          }
          return { slides: newSlides }
        })
      },

      updateElements: (updates) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            const updateMap = new Map(updates.map((u) => [u.id, u.changes]))
            currentSlide.elements = currentSlide.elements.map((el) => {
              const changes = updateMap.get(el.id)
              return changes ? ({ ...el, ...changes } as CanvasElement) : el
            })
          }
          return { slides: newSlides }
        })
      },

      // Z-ordering
      bringToFront: (id) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            const index = currentSlide.elements.findIndex((el) => el.id === id)
            if (index !== -1) {
              const [element] = currentSlide.elements.splice(index, 1)
              if (element) {
                currentSlide.elements.push(element)
              }
            }
          }
          return { slides: newSlides }
        })
      },

      sendToBack: (id) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            const index = currentSlide.elements.findIndex((el) => el.id === id)
            if (index !== -1) {
              const [element] = currentSlide.elements.splice(index, 1)
              if (element) {
                currentSlide.elements.unshift(element)
              }
            }
          }
          return { slides: newSlides }
        })
      },

      bringForward: (id) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            const index = currentSlide.elements.findIndex((el) => el.id === id)
            if (index !== -1 && index < currentSlide.elements.length - 1) {
              const temp = currentSlide.elements[index]
              const next = currentSlide.elements[index + 1]
              if (temp && next) {
                currentSlide.elements[index] = next
                currentSlide.elements[index + 1] = temp
              }
            }
          }
          return { slides: newSlides }
        })
      },

      sendBackward: (id) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            const index = currentSlide.elements.findIndex((el) => el.id === id)
            if (index > 0) {
              const temp = currentSlide.elements[index]
              const prev = currentSlide.elements[index - 1]
              if (temp && prev) {
                currentSlide.elements[index] = prev
                currentSlide.elements[index - 1] = temp
              }
            }
          }
          return { slides: newSlides }
        })
      },

      // Helpers
      getElementById: (id) => {
        const { slides, currentSlideIndex } = get()
        const currentSlide = slides[currentSlideIndex]
        return currentSlide?.elements.find((el) => el.id === id)
      },

      getCurrentSlide: () => {
        const { slides, currentSlideIndex } = get()
        return slides[currentSlideIndex]
      },

      setSlides: (slides) => {
        set({ slides, currentSlideIndex: 0 })
      },

      reset: () => set(initialState),
    })),
    { name: 'slides-store' }
  )
)

// Helper to create elements
export const createTextElement = (overrides: Partial<TextElement> = {}): TextElement => ({
  id: nanoid(),
  type: 'text',
  x: 100,
  y: 100,
  width: 300,
  height: 50,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  text: 'Your text here',
  fontSize: 48,
  fontFamily: 'Inter',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  fill: '#000000',
  ...overrides,
})

export const createRectElement = (overrides: Partial<RectElement> = {}): RectElement => ({
  id: nanoid(),
  type: 'rect',
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fill: '#3b82f6',
  cornerRadius: 8,
  ...overrides,
})

export const createCircleElement = (overrides: Partial<CircleElement> = {}): CircleElement => ({
  id: nanoid(),
  type: 'circle',
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fill: '#3b82f6',
  radius: 100,
  ...overrides,
})

export const createImageElement = (
  src: string,
  overrides: Partial<ImageElement> = {}
): ImageElement => ({
  id: nanoid(),
  type: 'image',
  x: 100,
  y: 100,
  width: 400,
  height: 300,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  src,
  ...overrides,
})
