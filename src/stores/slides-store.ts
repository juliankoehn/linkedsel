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
  | 'frame'

// Auto-layout types
export type LayoutMode = 'none' | 'horizontal' | 'vertical'
export type LayoutWrap = 'nowrap' | 'wrap'
export type AlignItems = 'start' | 'center' | 'end' | 'stretch'
export type JustifyContent = 'start' | 'center' | 'end' | 'space-between'

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

export interface FrameElement extends BaseElement {
  type: 'frame'
  children: CanvasElement[]

  // Auto-Layout Properties
  layoutMode: LayoutMode
  layoutWrap: LayoutWrap

  // Spacing
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  gap: number

  // Alignment (like Flexbox)
  alignItems: AlignItems
  justifyContent: JustifyContent

  // Sizing behavior
  autoWidth: boolean
  autoHeight: boolean

  // Size constraints (optional)
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number

  // Visual
  fill?: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
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
  | FrameElement

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

  // Grouping & Frames
  groupElements: (ids: string[]) => string | null
  ungroupElement: (id: string) => void
  createFrameFromElements: (ids: string[]) => string | null
  updateFrameLayout: (id: string) => void
  moveElementToParent: (elementId: string, targetParentId: string | null) => void
  renameElement: (id: string, name: string) => void

  // Helpers
  getElementById: (id: string) => CanvasElement | undefined
  getCurrentSlide: () => Slide | undefined
  setSlides: (slides: Slide[]) => void
  getElementsRecursive: (elements: CanvasElement[]) => CanvasElement[]

  reset: () => void
}

type SlidesStore = SlidesState & SlidesActions

const createEmptySlide = (): Slide => ({
  id: nanoid(),
  backgroundColor: '#ffffff',
  elements: [],
})

// Helper: Recursively update an element by id
const updateElementRecursive = (
  elements: CanvasElement[],
  id: string,
  updates: Partial<CanvasElement>
): CanvasElement[] => {
  return elements.map((el) => {
    if (el.id === id) {
      return { ...el, ...updates } as CanvasElement
    }
    if (el.type === 'group' || el.type === 'frame') {
      const container = el as GroupElement | FrameElement
      return {
        ...container,
        children: updateElementRecursive(container.children, id, updates),
      } as CanvasElement
    }
    return el
  })
}

// Helper: Find element by id recursively
const findElementRecursive = (elements: CanvasElement[], id: string): CanvasElement | undefined => {
  for (const el of elements) {
    if (el.id === id) return el
    if (el.type === 'group' || el.type === 'frame') {
      const container = el as GroupElement | FrameElement
      const found = findElementRecursive(container.children, id)
      if (found) return found
    }
  }
  return undefined
}

// Helper: Remove element from tree and return [newElements, removedElement]
const removeElementRecursive = (
  elements: CanvasElement[],
  id: string
): [CanvasElement[], CanvasElement | null] => {
  let removed: CanvasElement | null = null

  const newElements = elements.filter((el) => {
    if (el.id === id) {
      removed = el
      return false
    }
    return true
  })

  if (removed) return [newElements, removed]

  // Check in children
  return [
    newElements.map((el) => {
      if (el.type === 'group' || el.type === 'frame') {
        const container = el as GroupElement | FrameElement
        const [newChildren, foundRemoved] = removeElementRecursive(container.children, id)
        if (foundRemoved) removed = foundRemoved
        return { ...container, children: newChildren } as CanvasElement
      }
      return el
    }),
    removed,
  ]
}

// Helper: Add element to parent (or root if parentId is null)
const addElementToParent = (
  elements: CanvasElement[],
  element: CanvasElement,
  parentId: string | null
): CanvasElement[] => {
  if (!parentId) {
    return [...elements, element]
  }

  return elements.map((el) => {
    if (el.id === parentId && (el.type === 'group' || el.type === 'frame')) {
      const container = el as GroupElement | FrameElement
      return {
        ...container,
        children: [...container.children, element],
      } as CanvasElement
    }
    if (el.type === 'group' || el.type === 'frame') {
      const container = el as GroupElement | FrameElement
      return {
        ...container,
        children: addElementToParent(container.children, element, parentId),
      } as CanvasElement
    }
    return el
  })
}

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
            currentSlide.elements = updateElementRecursive(currentSlide.elements, id, updates)
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

      // Grouping & Frames
      groupElements: (ids) => {
        if (ids.length < 2) return null

        const { slides, currentSlideIndex } = get()
        const currentSlide = slides[currentSlideIndex]
        if (!currentSlide) return null

        const elementsToGroup = currentSlide.elements.filter((el) => ids.includes(el.id))
        if (elementsToGroup.length < 2) return null

        const group = createGroupElement(elementsToGroup)

        set((state) => {
          const newSlides = [...state.slides]
          const slide = newSlides[state.currentSlideIndex]
          if (slide) {
            // Remove grouped elements and add the group
            slide.elements = [...slide.elements.filter((el) => !ids.includes(el.id)), group]
          }
          return { slides: newSlides }
        })

        return group.id
      },

      ungroupElement: (id) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (!currentSlide) return { slides: newSlides }

          const element = currentSlide.elements.find((el) => el.id === id)
          if (!element || (element.type !== 'group' && element.type !== 'frame')) {
            return { slides: newSlides }
          }

          const groupOrFrame = element as GroupElement | FrameElement
          // Convert children back to absolute positions
          const unpackedChildren = groupOrFrame.children.map((child) => ({
            ...child,
            x: child.x + groupOrFrame.x,
            y: child.y + groupOrFrame.y,
          }))

          // Remove group/frame and add children
          const elementIndex = currentSlide.elements.findIndex((el) => el.id === id)
          currentSlide.elements = [
            ...currentSlide.elements.slice(0, elementIndex),
            ...unpackedChildren,
            ...currentSlide.elements.slice(elementIndex + 1),
          ]

          return { slides: newSlides }
        })
      },

      createFrameFromElements: (ids) => {
        if (ids.length < 1) return null

        const { slides, currentSlideIndex } = get()
        const currentSlide = slides[currentSlideIndex]
        if (!currentSlide) return null

        const elementsToFrame = currentSlide.elements.filter((el) => ids.includes(el.id))
        if (elementsToFrame.length === 0) return null

        const frame = createFrameElement(elementsToFrame)

        set((state) => {
          const newSlides = [...state.slides]
          const slide = newSlides[state.currentSlideIndex]
          if (slide) {
            // Remove framed elements and add the frame
            slide.elements = [...slide.elements.filter((el) => !ids.includes(el.id)), frame]
          }
          return { slides: newSlides }
        })

        return frame.id
      },

      updateFrameLayout: (id) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (!currentSlide) return { slides: newSlides }

          const frameIndex = currentSlide.elements.findIndex((el) => el.id === id)
          const frame = currentSlide.elements[frameIndex]
          if (!frame || frame.type !== 'frame') return { slides: newSlides }

          const typedFrame = frame as FrameElement
          if (typedFrame.layoutMode === 'none') return { slides: newSlides }

          // Calculate new positions based on layout mode
          const {
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            gap,
            layoutMode,
            layoutWrap,
            alignItems,
          } = typedFrame
          const children = [...typedFrame.children]

          const contentWidth = typedFrame.width - paddingLeft - paddingRight
          // contentHeight will be used for justify-content in future
          void (typedFrame.height - paddingTop - paddingBottom)

          if (layoutMode === 'horizontal') {
            let currentX = paddingLeft
            let currentY = paddingTop
            let rowHeight = 0
            let rowStartIndex = 0

            for (let i = 0; i < children.length; i++) {
              const child = children[i]!

              // Check for wrap
              if (
                layoutWrap === 'wrap' &&
                currentX + child.width > typedFrame.width - paddingRight &&
                i > rowStartIndex
              ) {
                // Apply alignment to completed row
                currentY += rowHeight + gap
                currentX = paddingLeft
                rowHeight = 0
                rowStartIndex = i
              }

              child.x = currentX
              child.y = currentY

              // Vertical alignment within row
              if (alignItems === 'center') {
                child.y = currentY + (rowHeight - child.height) / 2
              } else if (alignItems === 'end') {
                child.y = currentY + rowHeight - child.height
              }

              currentX += child.width + gap
              rowHeight = Math.max(rowHeight, child.height)
            }
          } else if (layoutMode === 'vertical') {
            const currentX = paddingLeft
            let currentY = paddingTop

            for (const child of children) {
              child.x = currentX
              child.y = currentY

              // Horizontal alignment
              if (alignItems === 'center') {
                child.x = paddingLeft + (contentWidth - child.width) / 2
              } else if (alignItems === 'end') {
                child.x = typedFrame.width - paddingRight - child.width
              } else if (alignItems === 'stretch') {
                child.width = contentWidth
              }

              currentY += child.height + gap
            }
          }

          currentSlide.elements[frameIndex] = { ...typedFrame, children }
          return { slides: newSlides }
        })
      },

      moveElementToParent: (elementId, targetParentId) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (!currentSlide) return { slides: newSlides }

          // Find the target parent to get its position
          const targetParent = targetParentId
            ? findElementRecursive(currentSlide.elements, targetParentId)
            : null

          // Find current parent to calculate absolute position
          const findParentOf = (
            elements: CanvasElement[],
            childId: string,
            parentPos = { x: 0, y: 0 }
          ): { x: number; y: number } | null => {
            for (const el of elements) {
              if (el.type === 'group' || el.type === 'frame') {
                const container = el as GroupElement | FrameElement
                if (container.children.some((c) => c.id === childId)) {
                  return { x: parentPos.x + el.x, y: parentPos.y + el.y }
                }
                const found = findParentOf(container.children, childId, {
                  x: parentPos.x + el.x,
                  y: parentPos.y + el.y,
                })
                if (found) return found
              }
            }
            return null
          }

          const currentParentPos = findParentOf(currentSlide.elements, elementId) || { x: 0, y: 0 }

          // Remove element from its current position
          const [elementsAfterRemoval, removedElement] = removeElementRecursive(
            currentSlide.elements,
            elementId
          )
          if (!removedElement) return { slides: newSlides }

          // Calculate element's absolute position
          const absoluteX = removedElement.x + currentParentPos.x
          const absoluteY = removedElement.y + currentParentPos.y

          // Convert to position relative to new parent
          const newX = targetParent ? absoluteX - targetParent.x : absoluteX
          const newY = targetParent ? absoluteY - targetParent.y : absoluteY

          // Update element position
          const repositionedElement = {
            ...removedElement,
            x: newX,
            y: newY,
          }

          // Add element to new parent (or root if null)
          currentSlide.elements = addElementToParent(
            elementsAfterRemoval,
            repositionedElement,
            targetParentId
          )

          return { slides: newSlides }
        })
      },

      renameElement: (id, name) => {
        set((state) => {
          const newSlides = [...state.slides]
          const currentSlide = newSlides[state.currentSlideIndex]
          if (currentSlide) {
            currentSlide.elements = updateElementRecursive(currentSlide.elements, id, { name })
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

      getElementsRecursive: (elements) => {
        const result: CanvasElement[] = []
        for (const el of elements) {
          result.push(el)
          if (el.type === 'group' || el.type === 'frame') {
            const container = el as GroupElement | FrameElement
            result.push(...get().getElementsRecursive(container.children))
          }
        }
        return result
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

export const createGroupElement = (
  children: CanvasElement[],
  overrides: Partial<GroupElement> = {}
): GroupElement => {
  // Calculate bounding box of children
  const bounds = calculateBounds(children)
  return {
    id: nanoid(),
    type: 'group',
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    children: children.map((child) => ({
      ...child,
      x: child.x - bounds.x,
      y: child.y - bounds.y,
    })),
    ...overrides,
  }
}

export const createFrameElement = (
  children: CanvasElement[] = [],
  overrides: Partial<FrameElement> = {}
): FrameElement => {
  // Calculate bounding box of children if any
  const bounds =
    children.length > 0 ? calculateBounds(children) : { x: 100, y: 100, width: 200, height: 200 }
  return {
    id: nanoid(),
    type: 'frame',
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    children: children.map((child) => ({
      ...child,
      x: child.x - bounds.x,
      y: child.y - bounds.y,
    })),
    // Auto-layout defaults (like Figma)
    layoutMode: 'horizontal',
    layoutWrap: 'nowrap',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    gap: 10,
    alignItems: 'start',
    justifyContent: 'start',
    autoWidth: true,
    autoHeight: true,
    // Visual defaults
    fill: 'transparent',
    cornerRadius: 0,
    ...overrides,
  }
}

// Helper to calculate bounding box of elements
function calculateBounds(elements: CanvasElement[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of elements) {
    minX = Math.min(minX, el.x)
    minY = Math.min(minY, el.y)
    maxX = Math.max(maxX, el.x + el.width)
    maxY = Math.max(maxY, el.y + el.height)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
