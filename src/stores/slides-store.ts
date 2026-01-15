import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

// Element types
export type ElementType =
  | 'text'
  | 'image'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'triangle'
  | 'star'
  | 'polygon'
  | 'icon'
  | 'group'

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
  textDecoration?: 'none' | 'underline' | 'line-through'
  shadow?: {
    enabled: boolean
    offsetX: number
    offsetY: number
    blur: number
    color: string
  }
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
  points: number[] // [x1, y1, x2, y2]
  stroke: string
  strokeWidth: number
  lineCap?: 'butt' | 'round' | 'square'
  dash?: number[] // e.g., [10, 5] for dashed
}

export interface ArrowElement extends BaseElement {
  type: 'arrow'
  points: number[] // [x1, y1, x2, y2]
  stroke: string
  strokeWidth: number
  pointerLength?: number
  pointerWidth?: number
  pointerAtStart?: boolean
  pointerAtEnd?: boolean
  lineCap?: 'butt' | 'round' | 'square'
  dash?: number[]
  fill?: string // For filled arrows
}

export interface TriangleElement extends BaseElement {
  type: 'triangle'
  fill: string
  stroke?: string
  strokeWidth?: number
}

export interface StarElement extends BaseElement {
  type: 'star'
  fill: string
  stroke?: string
  strokeWidth?: number
  numPoints: number // default 5
  innerRadius: number
  outerRadius: number
}

export interface PolygonElement extends BaseElement {
  type: 'polygon'
  fill: string
  stroke?: string
  strokeWidth?: number
  sides: number // 5=pentagon, 6=hexagon, etc.
}

export interface IconElement extends BaseElement {
  type: 'icon'
  iconName: string // Lucide icon name
  fill: string
  stroke?: string
  strokeWidth?: number
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
  | ArrowElement
  | TriangleElement
  | StarElement
  | PolygonElement
  | IconElement
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

  // Alignment
  alignElements: (
    ids: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => void
  distributeElements: (ids: string[], direction: 'horizontal' | 'vertical') => void

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

      // Alignment
      alignElements: (ids, alignment) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (!currentSlide || ids.length < 2) return { slides: newSlides }

          const elements = currentSlide.elements.filter((el) => ids.includes(el.id))
          if (elements.length < 2) return { slides: newSlides }

          // Calculate bounds
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity
          for (const el of elements) {
            minX = Math.min(minX, el.x)
            minY = Math.min(minY, el.y)
            maxX = Math.max(maxX, el.x + el.width)
            maxY = Math.max(maxY, el.y + el.height)
          }

          const centerX = (minX + maxX) / 2
          const centerY = (minY + maxY) / 2

          // Apply alignment
          currentSlide.elements = currentSlide.elements.map((el) => {
            if (!ids.includes(el.id)) return el
            switch (alignment) {
              case 'left':
                return { ...el, x: minX }
              case 'center':
                return { ...el, x: centerX - el.width / 2 }
              case 'right':
                return { ...el, x: maxX - el.width }
              case 'top':
                return { ...el, y: minY }
              case 'middle':
                return { ...el, y: centerY - el.height / 2 }
              case 'bottom':
                return { ...el, y: maxY - el.height }
              default:
                return el
            }
          })

          return { slides: newSlides }
        })
      },

      distributeElements: (ids, direction) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (!currentSlide || ids.length < 3) return { slides: newSlides }

          const elements = currentSlide.elements
            .filter((el) => ids.includes(el.id))
            .sort((a, b) => (direction === 'horizontal' ? a.x - b.x : a.y - b.y))

          if (elements.length < 3) return { slides: newSlides }

          const first = elements[0]!
          const last = elements[elements.length - 1]!

          if (direction === 'horizontal') {
            const totalWidth = last.x + last.width - first.x
            const elementWidths = elements.reduce((sum, el) => sum + el.width, 0)
            const gap = (totalWidth - elementWidths) / (elements.length - 1)

            let currentX = first.x
            const updates = new Map<string, number>()
            for (const el of elements) {
              updates.set(el.id, currentX)
              currentX += el.width + gap
            }

            currentSlide.elements = currentSlide.elements.map((el) => {
              const newX = updates.get(el.id)
              return newX !== undefined ? { ...el, x: newX } : el
            })
          } else {
            const totalHeight = last.y + last.height - first.y
            const elementHeights = elements.reduce((sum, el) => sum + el.height, 0)
            const gap = (totalHeight - elementHeights) / (elements.length - 1)

            let currentY = first.y
            const updates = new Map<string, number>()
            for (const el of elements) {
              updates.set(el.id, currentY)
              currentY += el.height + gap
            }

            currentSlide.elements = currentSlide.elements.map((el) => {
              const newY = updates.get(el.id)
              return newY !== undefined ? { ...el, y: newY } : el
            })
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

export const createLineElement = (overrides: Partial<LineElement> = {}): LineElement => ({
  id: nanoid(),
  type: 'line',
  x: 100,
  y: 100,
  width: 200,
  height: 0,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  points: [0, 0, 200, 0],
  stroke: '#000000',
  strokeWidth: 2,
  lineCap: 'round',
  ...overrides,
})

export const createArrowElement = (overrides: Partial<ArrowElement> = {}): ArrowElement => ({
  id: nanoid(),
  type: 'arrow',
  x: 100,
  y: 100,
  width: 200,
  height: 0,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  points: [0, 0, 200, 0],
  stroke: '#000000',
  strokeWidth: 2,
  pointerLength: 15,
  pointerWidth: 15,
  pointerAtEnd: true,
  lineCap: 'round',
  ...overrides,
})

export const createTriangleElement = (
  overrides: Partial<TriangleElement> = {}
): TriangleElement => ({
  id: nanoid(),
  type: 'triangle',
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fill: '#3b82f6',
  ...overrides,
})

export const createStarElement = (overrides: Partial<StarElement> = {}): StarElement => ({
  id: nanoid(),
  type: 'star',
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fill: '#f59e0b',
  numPoints: 5,
  innerRadius: 25,
  outerRadius: 50,
  ...overrides,
})

export const createPolygonElement = (
  sides: number = 6,
  overrides: Partial<PolygonElement> = {}
): PolygonElement => ({
  id: nanoid(),
  type: 'polygon',
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fill: '#8b5cf6',
  sides,
  ...overrides,
})

export const createIconElement = (
  iconName: string,
  overrides: Partial<IconElement> = {}
): IconElement => ({
  id: nanoid(),
  type: 'icon',
  x: 100,
  y: 100,
  width: 48,
  height: 48,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  iconName,
  fill: '#000000',
  ...overrides,
})
