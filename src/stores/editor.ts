import * as fabric from 'fabric'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { generateId } from '@/lib/utils'
import type { CarouselTemplate, SlideTemplate } from '@/types/templates'

interface Slide {
  id: string
  backgroundColor: string
  objects: fabric.FabricObject[]
}

interface EditorState {
  canvas: fabric.Canvas | null
  slides: Slide[]
  currentSlideIndex: number
  history: { past: Slide[][]; future: Slide[][] }
  projectName: string
  hasWatermark: boolean
  selectedObject: fabric.FabricObject | null

  // Actions
  initCanvas: (canvasElement: HTMLCanvasElement) => void
  setCurrentSlide: (index: number) => void
  addSlide: () => void
  duplicateSlide: (index: number) => void
  removeSlide: (index: number) => void
  addText: () => void
  addShape: (type: 'rect' | 'circle') => void
  addImage: (file: File) => Promise<void>
  addImageFromUrl: (url: string) => Promise<void>
  deleteSelected: () => void
  undo: () => void
  redo: () => void
  saveHistory: () => void
  exportPDF: () => Promise<void>
  saveCurrentSlide: () => void
  loadTemplate: (template: CarouselTemplate) => void
  setProjectName: (name: string) => void
  setHasWatermark: (hasWatermark: boolean) => void
  setBackgroundColor: (color: string) => void
  updateSelectedObject: (props: Record<string, unknown>) => void
  setSelectedObject: (obj: fabric.FabricObject | null) => void
  reset: () => void
}

// LinkedIn carousel dimensions (1080 x 1350)
export const CANVAS_WIDTH = 1080
export const CANVAS_HEIGHT = 1350
const DISPLAY_SCALE = 0.4

const createEmptySlide = (): Slide => ({
  id: generateId(),
  backgroundColor: '#ffffff',
  objects: [],
})

// Deep clone slides for history
const cloneSlides = (slides: Slide[]): Slide[] => {
  return slides.map((slide) => ({
    ...slide,
    objects: [...slide.objects],
  }))
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      canvas: null,
      slides: [createEmptySlide()],
      currentSlideIndex: 0,
      history: { past: [], future: [] },
      projectName: 'Neues Carousel',
      hasWatermark: true,
      selectedObject: null,

      initCanvas: (canvasElement: HTMLCanvasElement) => {
        // Dispose of existing canvas if any
        const existingCanvas = get().canvas
        if (existingCanvas) {
          existingCanvas.dispose()
        }

        const canvas = new fabric.Canvas(canvasElement, {
          width: CANVAS_WIDTH * DISPLAY_SCALE,
          height: CANVAS_HEIGHT * DISPLAY_SCALE,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true,
        })

        // Set zoom to display scale
        canvas.setZoom(DISPLAY_SCALE)

        // Selection event handlers
        canvas.on('selection:created', (e) => {
          set({ selectedObject: e.selected?.[0] || null })
        })
        canvas.on('selection:updated', (e) => {
          set({ selectedObject: e.selected?.[0] || null })
        })
        canvas.on('selection:cleared', () => {
          set({ selectedObject: null })
        })

        // Auto-save on object modification
        canvas.on('object:modified', () => {
          get().saveCurrentSlide()
        })

        // Load first slide if it has objects
        const { slides, currentSlideIndex } = get()
        const currentSlide = slides[currentSlideIndex]
        if (currentSlide) {
          canvas.backgroundColor = currentSlide.backgroundColor
          currentSlide.objects.forEach((obj) => canvas.add(obj))
        }

        canvas.renderAll()
        set({ canvas })
      },

      setCurrentSlide: (index: number) => {
        const { canvas, slides, currentSlideIndex } = get()
        if (!canvas || index === currentSlideIndex || index >= slides.length)
          return

        // Save current slide objects
        get().saveCurrentSlide()

        // Clear canvas and load new slide
        canvas.clear()

        const newSlide = slides[index]
        if (newSlide) {
          canvas.backgroundColor = newSlide.backgroundColor
          newSlide.objects.forEach((obj) => canvas.add(obj))
        }

        canvas.renderAll()
        set({ currentSlideIndex: index, selectedObject: null })
      },

      addSlide: () => {
        get().saveHistory()
        const { slides, canvas } = get()

        // Save current slide first
        if (canvas) {
          get().saveCurrentSlide()
        }

        const newSlide = createEmptySlide()
        set({
          slides: [...slides, newSlide],
          currentSlideIndex: slides.length,
        })

        // Clear canvas for new slide
        if (canvas) {
          canvas.clear()
          canvas.backgroundColor = newSlide.backgroundColor
          canvas.renderAll()
        }
      },

      duplicateSlide: (index: number) => {
        get().saveHistory()
        const { slides, canvas } = get()
        const slideToClone = slides[index]
        if (!slideToClone) return

        // Save current slide first
        if (canvas) {
          get().saveCurrentSlide()
        }

        const newSlide: Slide = {
          id: generateId(),
          backgroundColor: slideToClone.backgroundColor,
          objects: [...slideToClone.objects],
        }

        const newSlides = [...slides]
        newSlides.splice(index + 1, 0, newSlide)

        set({
          slides: newSlides,
          currentSlideIndex: index + 1,
        })

        // Load the duplicated slide
        if (canvas) {
          canvas.clear()
          canvas.backgroundColor = newSlide.backgroundColor
          newSlide.objects.forEach((obj) => canvas.add(obj))
          canvas.renderAll()
        }
      },

      removeSlide: (index: number) => {
        const { slides, currentSlideIndex, canvas } = get()
        if (slides.length <= 1) return

        get().saveHistory()

        const newSlides = slides.filter((_, i) => i !== index)
        const newIndex = Math.min(currentSlideIndex, newSlides.length - 1)

        set({ slides: newSlides, currentSlideIndex: newIndex })

        // Load the new current slide
        if (canvas) {
          const slideToLoad = newSlides[newIndex]
          if (slideToLoad) {
            canvas.clear()
            canvas.backgroundColor = slideToLoad.backgroundColor
            slideToLoad.objects.forEach((obj) => canvas.add(obj))
            canvas.renderAll()
          }
        }
      },

      addText: () => {
        const { canvas } = get()
        if (!canvas) return

        get().saveHistory()

        const text = new fabric.IText('Dein Text hier', {
          left: CANVAS_WIDTH / 2 - 150,
          top: CANVAS_HEIGHT / 2 - 30,
          fontSize: 48,
          fontFamily: 'Inter',
          fill: '#000000',
          fontWeight: 'normal',
        })

        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
        get().saveCurrentSlide()
      },

      addShape: (type: 'rect' | 'circle') => {
        const { canvas } = get()
        if (!canvas) return

        get().saveHistory()

        let shape: fabric.FabricObject

        if (type === 'rect') {
          shape = new fabric.Rect({
            left: CANVAS_WIDTH / 2 - 100,
            top: CANVAS_HEIGHT / 2 - 100,
            width: 200,
            height: 200,
            fill: '#3b82f6',
            rx: 8,
            ry: 8,
          })
        } else {
          shape = new fabric.Circle({
            left: CANVAS_WIDTH / 2 - 100,
            top: CANVAS_HEIGHT / 2 - 100,
            radius: 100,
            fill: '#3b82f6',
          })
        }

        canvas.add(shape)
        canvas.setActiveObject(shape)
        canvas.renderAll()
        get().saveCurrentSlide()
      },

      addImage: async (file: File) => {
        const { canvas } = get()
        if (!canvas) return

        get().saveHistory()

        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = async (e) => {
            try {
              const dataUrl = e.target?.result as string
              const img = await fabric.FabricImage.fromURL(dataUrl)

              // Scale to fit canvas width (80%)
              const maxWidth = CANVAS_WIDTH * 0.8
              const maxHeight = CANVAS_HEIGHT * 0.8

              if (img.width && img.height) {
                const scaleX = maxWidth / img.width
                const scaleY = maxHeight / img.height
                const scale = Math.min(scaleX, scaleY, 1)

                img.scale(scale)
              }

              img.set({
                left: CANVAS_WIDTH / 2 - (img.getScaledWidth() || 0) / 2,
                top: CANVAS_HEIGHT / 2 - (img.getScaledHeight() || 0) / 2,
              })

              canvas.add(img)
              canvas.setActiveObject(img)
              canvas.renderAll()
              get().saveCurrentSlide()
              resolve()
            } catch (err) {
              reject(err)
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      },

      addImageFromUrl: async (url: string) => {
        const { canvas } = get()
        if (!canvas) return

        get().saveHistory()

        const img = await fabric.FabricImage.fromURL(url, {
          crossOrigin: 'anonymous',
        })

        const maxWidth = CANVAS_WIDTH * 0.8
        const maxHeight = CANVAS_HEIGHT * 0.8

        if (img.width && img.height) {
          const scaleX = maxWidth / img.width
          const scaleY = maxHeight / img.height
          const scale = Math.min(scaleX, scaleY, 1)
          img.scale(scale)
        }

        img.set({
          left: CANVAS_WIDTH / 2 - (img.getScaledWidth() || 0) / 2,
          top: CANVAS_HEIGHT / 2 - (img.getScaledHeight() || 0) / 2,
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        get().saveCurrentSlide()
      },

      deleteSelected: () => {
        const { canvas } = get()
        if (!canvas) return

        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length > 0) {
          get().saveHistory()
          activeObjects.forEach((obj) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
          get().saveCurrentSlide()
        }
      },

      saveHistory: () => {
        const { slides, history } = get()
        set({
          history: {
            past: [...history.past.slice(-19), cloneSlides(slides)],
            future: [],
          },
        })
      },

      undo: () => {
        const { history, canvas } = get()
        if (history.past.length === 0) return

        const newPast = [...history.past]
        const previous = newPast.pop()

        if (previous) {
          const currentSlides = cloneSlides(get().slides)

          set({
            slides: previous,
            history: {
              past: newPast,
              future: [currentSlides, ...history.future],
            },
          })

          // Reload current slide on canvas
          const { currentSlideIndex } = get()
          const slideToLoad = previous[currentSlideIndex] || previous[0]
          if (canvas && slideToLoad) {
            canvas.clear()
            canvas.backgroundColor = slideToLoad.backgroundColor
            slideToLoad.objects.forEach((obj) => canvas.add(obj))
            canvas.renderAll()
          }
        }
      },

      redo: () => {
        const { history, canvas } = get()
        if (history.future.length === 0) return

        const newFuture = [...history.future]
        const next = newFuture.shift()

        if (next) {
          const currentSlides = cloneSlides(get().slides)

          set({
            slides: next,
            history: {
              past: [...history.past, currentSlides],
              future: newFuture,
            },
          })

          // Reload current slide on canvas
          const { currentSlideIndex } = get()
          const slideToLoad = next[currentSlideIndex] || next[0]
          if (canvas && slideToLoad) {
            canvas.clear()
            canvas.backgroundColor = slideToLoad.backgroundColor
            slideToLoad.objects.forEach((obj) => canvas.add(obj))
            canvas.renderAll()
          }
        }
      },

      exportPDF: async () => {
        const { canvas, slides, hasWatermark, projectName } = get()
        if (!canvas) return

        const { jsPDF } = await import('jspdf')

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [CANVAS_WIDTH, CANVAS_HEIGHT],
        })

        get().saveCurrentSlide()

        let watermarkText: fabric.FabricText | null = null
        if (hasWatermark) {
          watermarkText = new fabric.FabricText('LinkedSel.de', {
            fontSize: 32,
            fontFamily: 'Inter, sans-serif',
            fill: 'rgba(0, 0, 0, 0.15)',
            left: CANVAS_WIDTH - 180,
            top: CANVAS_HEIGHT - 60,
            selectable: false,
            evented: false,
          })
        }

        for (let i = 0; i < slides.length; i++) {
          if (i > 0) {
            pdf.addPage([CANVAS_WIDTH, CANVAS_HEIGHT])
          }

          canvas.clear()
          canvas.backgroundColor = '#ffffff'
          const slide = slides[i]
          if (slide) {
            canvas.backgroundColor = slide.backgroundColor
            slide.objects.forEach((obj) => canvas.add(obj))
          }

          if (watermarkText) {
            canvas.add(watermarkText)
          }

          canvas.renderAll()

          const dataUrl = canvas.toDataURL({
            format: 'png',
            multiplier: 1 / DISPLAY_SCALE,
          })

          pdf.addImage(dataUrl, 'PNG', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

          if (watermarkText) {
            canvas.remove(watermarkText)
          }
        }

        const { currentSlideIndex } = get()
        canvas.clear()
        canvas.backgroundColor = '#ffffff'
        const currentSlide = slides[currentSlideIndex]
        if (currentSlide) {
          canvas.backgroundColor = currentSlide.backgroundColor
          currentSlide.objects.forEach((obj) => canvas.add(obj))
        }
        canvas.renderAll()

        const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        pdf.save(filename)
      },

      saveCurrentSlide: () => {
        const { canvas, slides, currentSlideIndex } = get()
        if (!canvas) return

        const objects = canvas.getObjects()
        const updatedSlides = [...slides]
        const slide = updatedSlides[currentSlideIndex]
        if (slide) {
          slide.objects = objects
          slide.backgroundColor = canvas.backgroundColor as string
        }

        set({ slides: updatedSlides })
      },

      loadTemplate: (template: CarouselTemplate) => {
        const { canvas } = get()

        const newSlides: Slide[] = template.slides.map((slideTemplate) =>
          convertTemplateSlide(slideTemplate)
        )

        set({
          slides: newSlides,
          currentSlideIndex: 0,
          projectName: template.name,
          history: { past: [], future: [] },
        })

        if (canvas && newSlides[0]) {
          canvas.clear()
          canvas.backgroundColor = newSlides[0].backgroundColor
          newSlides[0].objects.forEach((obj) => canvas.add(obj))
          canvas.renderAll()
        }
      },

      setProjectName: (name: string) => {
        set({ projectName: name })
      },

      setHasWatermark: (hasWatermark: boolean) => {
        set({ hasWatermark })
      },

      setBackgroundColor: (color: string) => {
        const { canvas, slides, currentSlideIndex } = get()
        if (!canvas) return

        get().saveHistory()
        canvas.backgroundColor = color
        canvas.renderAll()

        const updatedSlides = [...slides]
        const slide = updatedSlides[currentSlideIndex]
        if (slide) {
          slide.backgroundColor = color
        }
        set({ slides: updatedSlides })
      },

      updateSelectedObject: (props: Record<string, unknown>) => {
        const { canvas, selectedObject } = get()
        if (!canvas || !selectedObject) return

        get().saveHistory()
        selectedObject.set(props)
        canvas.renderAll()
        get().saveCurrentSlide()
      },

      setSelectedObject: (obj: fabric.FabricObject | null) => {
        set({ selectedObject: obj })
      },

      reset: () => {
        const { canvas } = get()
        const emptySlide = createEmptySlide()

        set({
          slides: [emptySlide],
          currentSlideIndex: 0,
          history: { past: [], future: [] },
          projectName: 'Neues Carousel',
          hasWatermark: true,
          selectedObject: null,
        })

        if (canvas) {
          canvas.clear()
          canvas.backgroundColor = emptySlide.backgroundColor
          canvas.renderAll()
        }
      },
    }),
    { name: 'editor-store' }
  )
)

function convertTemplateSlide(slideTemplate: SlideTemplate): Slide {
  const objects: fabric.FabricObject[] = []

  for (const element of slideTemplate.elements) {
    if (element.type === 'text') {
      const props = element.props as {
        text: string
        left: number
        top: number
        fontSize: number
        fontFamily: string
        fill: string
        fontWeight?: string
        textAlign?: string
        width?: number
      }
      const text = new fabric.IText(props.text, {
        left: props.left,
        top: props.top,
        fontSize: props.fontSize,
        fontFamily: props.fontFamily,
        fill: props.fill,
        fontWeight: props.fontWeight || 'normal',
        textAlign: props.textAlign || 'left',
        width: props.width,
      })
      objects.push(text)
    } else if (element.type === 'shape') {
      const props = element.props as {
        shape: 'rect' | 'circle'
        left: number
        top: number
        width?: number
        height?: number
        radius?: number
        fill: string
        rx?: number
        ry?: number
      }
      if (props.shape === 'rect') {
        const rect = new fabric.Rect({
          left: props.left,
          top: props.top,
          width: props.width || 100,
          height: props.height || 100,
          fill: props.fill,
          rx: props.rx || 0,
          ry: props.ry || 0,
        })
        objects.push(rect)
      } else if (props.shape === 'circle') {
        const circle = new fabric.Circle({
          left: props.left,
          top: props.top,
          radius: props.radius || 50,
          fill: props.fill,
        })
        objects.push(circle)
      }
    }
  }

  return {
    id: slideTemplate.id,
    backgroundColor: slideTemplate.backgroundColor,
    objects,
  }
}
