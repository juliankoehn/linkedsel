import * as fabric from 'fabric'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { generateId } from '@/lib/utils'

interface Slide {
  id: string
  objects: fabric.FabricObject[]
}

interface EditorState {
  canvas: fabric.Canvas | null
  slides: Slide[]
  currentSlideIndex: number
  history: { past: Slide[][]; future: Slide[][] }

  // Actions
  initCanvas: (canvasElement: HTMLCanvasElement) => void
  setCurrentSlide: (index: number) => void
  addSlide: () => void
  removeSlide: (index: number) => void
  addText: () => void
  addShape: (type: 'rect' | 'circle') => void
  addImage: (url: string) => void
  deleteSelected: () => void
  undo: () => void
  redo: () => void
  exportPDF: () => Promise<void>
  saveCurrentSlide: () => void
}

// LinkedIn carousel dimensions (1080 x 1350)
const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1350
const DISPLAY_SCALE = 0.4

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      canvas: null,
      slides: [{ id: generateId(), objects: [] }],
      currentSlideIndex: 0,
      history: { past: [], future: [] },

      initCanvas: (canvasElement: HTMLCanvasElement) => {
        const canvas = new fabric.Canvas(canvasElement, {
          width: CANVAS_WIDTH * DISPLAY_SCALE,
          height: CANVAS_HEIGHT * DISPLAY_SCALE,
          backgroundColor: '#ffffff',
        })

        // Set zoom to display scale
        canvas.setZoom(DISPLAY_SCALE)

        // Load first slide if it has objects
        const { slides, currentSlideIndex } = get()
        const currentSlide = slides[currentSlideIndex]
        if (currentSlide && currentSlide.objects.length > 0) {
          currentSlide.objects.forEach((obj) => canvas.add(obj))
        }

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
        canvas.backgroundColor = '#ffffff'

        const newSlide = slides[index]
        if (newSlide && newSlide.objects.length > 0) {
          newSlide.objects.forEach((obj) => canvas.add(obj))
        }

        canvas.renderAll()
        set({ currentSlideIndex: index })
      },

      addSlide: () => {
        const { slides } = get()
        const newSlide: Slide = { id: generateId(), objects: [] }
        set({
          slides: [...slides, newSlide],
          currentSlideIndex: slides.length,
        })

        // Clear canvas for new slide
        const { canvas } = get()
        if (canvas) {
          get().saveCurrentSlide()
          canvas.clear()
          canvas.backgroundColor = '#ffffff'
          canvas.renderAll()
        }
      },

      removeSlide: (index: number) => {
        const { slides, currentSlideIndex } = get()
        if (slides.length <= 1) return

        const newSlides = slides.filter((_, i) => i !== index)
        const newIndex = Math.min(currentSlideIndex, newSlides.length - 1)

        set({ slides: newSlides, currentSlideIndex: newIndex })
      },

      addText: () => {
        const { canvas } = get()
        if (!canvas) return

        const text = new fabric.IText('Dein Text hier', {
          left: CANVAS_WIDTH / 2 - 100,
          top: CANVAS_HEIGHT / 2 - 20,
          fontSize: 48,
          fontFamily: 'Inter',
          fill: '#000000',
        })

        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
      },

      addShape: (type: 'rect' | 'circle') => {
        const { canvas } = get()
        if (!canvas) return

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
      },

      addImage: async (url: string) => {
        const { canvas } = get()
        if (!canvas) return

        const img = await fabric.FabricImage.fromURL(url)
        img.scaleToWidth(CANVAS_WIDTH * 0.8)
        img.set({
          left: CANVAS_WIDTH / 2 - img.getScaledWidth() / 2,
          top: CANVAS_HEIGHT / 2 - img.getScaledHeight() / 2,
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
      },

      deleteSelected: () => {
        const { canvas } = get()
        if (!canvas) return

        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
        }
      },

      undo: () => {
        const { history } = get()
        if (history.past.length === 0) return

        const newPast = [...history.past]
        const previous = newPast.pop()

        if (previous) {
          set({
            slides: previous,
            history: {
              past: newPast,
              future: [get().slides, ...history.future],
            },
          })
        }
      },

      redo: () => {
        const { history } = get()
        if (history.future.length === 0) return

        const newFuture = [...history.future]
        const next = newFuture.shift()

        if (next) {
          set({
            slides: next,
            history: {
              past: [...history.past, get().slides],
              future: newFuture,
            },
          })
        }
      },

      exportPDF: async () => {
        const { canvas, slides } = get()
        if (!canvas) return

        // Dynamic import for jsPDF to reduce bundle size
        const { jsPDF } = await import('jspdf')

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [CANVAS_WIDTH, CANVAS_HEIGHT],
        })

        // Save current slide first
        get().saveCurrentSlide()

        for (let i = 0; i < slides.length; i++) {
          if (i > 0) {
            pdf.addPage([CANVAS_WIDTH, CANVAS_HEIGHT])
          }

          // Load slide objects to canvas
          canvas.clear()
          canvas.backgroundColor = '#ffffff'
          const slide = slides[i]
          if (slide) {
            slide.objects.forEach((obj) => canvas.add(obj))
          }
          canvas.renderAll()

          // Get data URL at full resolution
          const dataUrl = canvas.toDataURL({
            format: 'png',
            multiplier: 1 / DISPLAY_SCALE,
          })

          pdf.addImage(dataUrl, 'PNG', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        }

        // Restore current slide
        const { currentSlideIndex } = get()
        canvas.clear()
        canvas.backgroundColor = '#ffffff'
        const currentSlide = slides[currentSlideIndex]
        if (currentSlide) {
          currentSlide.objects.forEach((obj) => canvas.add(obj))
        }
        canvas.renderAll()

        pdf.save('carousel.pdf')
      },

      saveCurrentSlide: () => {
        const { canvas, slides, currentSlideIndex } = get()
        if (!canvas) return

        const objects = canvas.getObjects()
        const updatedSlides = [...slides]
        const slide = updatedSlides[currentSlideIndex]
        if (slide) {
          slide.objects = objects
        }

        set({ slides: updatedSlides })
      },
    }),
    { name: 'editor-store' }
  )
)
