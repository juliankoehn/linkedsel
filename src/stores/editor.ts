import * as fabric from 'fabric'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { generateId } from '@/lib/utils'
import type { CarouselTemplate, SlideTemplate } from '@/types/templates'

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

interface SerializedObject {
  type: string
  props: Record<string, unknown>
}

interface SerializedSlide {
  id: string
  backgroundColor: string
  objects: SerializedObject[]
}

export interface ProjectData {
  format: FormatPreset
  slides: SerializedSlide[]
}

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
  projectId: string | null
  projectName: string
  hasWatermark: boolean
  selectedObject: fabric.FabricObject | null
  format: FormatPreset
  isSaving: boolean
  isDirty: boolean

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

  // Z-Order
  bringToFront: () => void
  sendToBack: () => void
  bringForward: () => void
  sendBackward: () => void

  // Format
  setFormat: (format: FormatPreset) => void

  // Project persistence
  saveProject: () => Promise<string | null>
  loadProject: (projectId: string) => Promise<boolean>
  serializeProject: () => ProjectData
  deserializeProject: (data: ProjectData) => void

  reset: () => void
}

const DISPLAY_SCALE = 0.4

const getCanvasDimensions = (format: FormatPreset) => {
  const preset = FORMAT_PRESETS[format]
  return { width: preset.width, height: preset.height }
}

const createEmptySlide = (): Slide => ({
  id: generateId(),
  backgroundColor: '#ffffff',
  objects: [],
})

const cloneSlides = (slides: Slide[]): Slide[] => {
  return slides.map((slide) => ({
    ...slide,
    objects: [...slide.objects],
  }))
}

// Serialize fabric object to plain object
const serializeObject = (obj: fabric.FabricObject): SerializedObject => {
  const type = obj.type || 'object'
  const props: Record<string, unknown> = {
    left: obj.left,
    top: obj.top,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
    angle: obj.angle,
    fill: obj.fill,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    opacity: obj.opacity,
  }

  if (obj instanceof fabric.IText) {
    props.text = obj.text
    props.fontSize = obj.fontSize
    props.fontFamily = obj.fontFamily
    props.fontWeight = obj.fontWeight
    props.fontStyle = obj.fontStyle
    props.textAlign = obj.textAlign
    props.width = obj.width
  } else if (obj instanceof fabric.Rect) {
    props.width = obj.width
    props.height = obj.height
    props.rx = obj.rx
    props.ry = obj.ry
  } else if (obj instanceof fabric.Circle) {
    props.radius = obj.radius
  } else if (obj instanceof fabric.FabricImage) {
    const src = obj.getSrc()
    props.src = src
    props.width = obj.width
    props.height = obj.height
  }

  return { type, props }
}

// Deserialize plain object to fabric object
const deserializeObject = async (
  serialized: SerializedObject
): Promise<fabric.FabricObject | null> => {
  const { type, props } = serialized

  if (type === 'i-text' || type === 'text') {
    return new fabric.IText((props.text as string) || '', {
      left: props.left as number,
      top: props.top as number,
      scaleX: props.scaleX as number,
      scaleY: props.scaleY as number,
      angle: props.angle as number,
      fill: props.fill as string,
      fontSize: props.fontSize as number,
      fontFamily: props.fontFamily as string,
      fontWeight: props.fontWeight as string,
      fontStyle: props.fontStyle as string,
      textAlign: props.textAlign as string,
      width: props.width as number,
    })
  } else if (type === 'rect') {
    return new fabric.Rect({
      left: props.left as number,
      top: props.top as number,
      scaleX: props.scaleX as number,
      scaleY: props.scaleY as number,
      angle: props.angle as number,
      fill: props.fill as string,
      width: props.width as number,
      height: props.height as number,
      rx: props.rx as number,
      ry: props.ry as number,
    })
  } else if (type === 'circle') {
    return new fabric.Circle({
      left: props.left as number,
      top: props.top as number,
      scaleX: props.scaleX as number,
      scaleY: props.scaleY as number,
      angle: props.angle as number,
      fill: props.fill as string,
      radius: props.radius as number,
    })
  } else if (type === 'image' && props.src) {
    try {
      const img = await fabric.FabricImage.fromURL(props.src as string, {
        crossOrigin: 'anonymous',
      })
      img.set({
        left: props.left as number,
        top: props.top as number,
        scaleX: props.scaleX as number,
        scaleY: props.scaleY as number,
        angle: props.angle as number,
      })
      return img
    } catch {
      return null
    }
  }

  return null
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      canvas: null,
      slides: [createEmptySlide()],
      currentSlideIndex: 0,
      history: { past: [], future: [] },
      projectId: null,
      projectName: 'Neues Carousel',
      hasWatermark: true,
      selectedObject: null,
      format: 'linkedin-portrait',
      isSaving: false,
      isDirty: false,

      initCanvas: (canvasElement: HTMLCanvasElement) => {
        const existingCanvas = get().canvas
        if (existingCanvas) {
          existingCanvas.dispose()
        }

        const { format } = get()
        const { width, height } = getCanvasDimensions(format)

        const canvas = new fabric.Canvas(canvasElement, {
          width: width * DISPLAY_SCALE,
          height: height * DISPLAY_SCALE,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true,
        })

        canvas.setZoom(DISPLAY_SCALE)

        canvas.on('selection:created', (e) => {
          set({ selectedObject: e.selected?.[0] || null })
        })
        canvas.on('selection:updated', (e) => {
          set({ selectedObject: e.selected?.[0] || null })
        })
        canvas.on('selection:cleared', () => {
          set({ selectedObject: null })
        })

        canvas.on('object:modified', () => {
          get().saveCurrentSlide()
          set({ isDirty: true })
        })

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

        get().saveCurrentSlide()
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

        if (canvas) {
          get().saveCurrentSlide()
        }

        const newSlide = createEmptySlide()
        set({
          slides: [...slides, newSlide],
          currentSlideIndex: slides.length,
          isDirty: true,
        })

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
          isDirty: true,
        })

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

        set({ slides: newSlides, currentSlideIndex: newIndex, isDirty: true })

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
        const { canvas, format } = get()
        if (!canvas) return

        get().saveHistory()
        const { width, height } = getCanvasDimensions(format)

        const text = new fabric.IText('Dein Text hier', {
          left: width / 2 - 150,
          top: height / 2 - 30,
          fontSize: 48,
          fontFamily: 'Inter',
          fill: '#000000',
          fontWeight: 'normal',
        })

        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
      },

      addShape: (type: 'rect' | 'circle') => {
        const { canvas, format } = get()
        if (!canvas) return

        get().saveHistory()
        const { width, height } = getCanvasDimensions(format)

        let shape: fabric.FabricObject

        if (type === 'rect') {
          shape = new fabric.Rect({
            left: width / 2 - 100,
            top: height / 2 - 100,
            width: 200,
            height: 200,
            fill: '#3b82f6',
            rx: 8,
            ry: 8,
          })
        } else {
          shape = new fabric.Circle({
            left: width / 2 - 100,
            top: height / 2 - 100,
            radius: 100,
            fill: '#3b82f6',
          })
        }

        canvas.add(shape)
        canvas.setActiveObject(shape)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
      },

      addImage: async (file: File) => {
        const { canvas, format } = get()
        if (!canvas) return

        get().saveHistory()
        const { width, height } = getCanvasDimensions(format)

        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = async (e) => {
            try {
              const dataUrl = e.target?.result as string
              const img = await fabric.FabricImage.fromURL(dataUrl)

              const maxWidth = width * 0.8
              const maxHeight = height * 0.8

              if (img.width && img.height) {
                const scaleX = maxWidth / img.width
                const scaleY = maxHeight / img.height
                const scale = Math.min(scaleX, scaleY, 1)
                img.scale(scale)
              }

              img.set({
                left: width / 2 - (img.getScaledWidth() || 0) / 2,
                top: height / 2 - (img.getScaledHeight() || 0) / 2,
              })

              canvas.add(img)
              canvas.setActiveObject(img)
              canvas.renderAll()
              get().saveCurrentSlide()
              set({ isDirty: true })
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
        const { canvas, format } = get()
        if (!canvas) return

        get().saveHistory()
        const { width, height } = getCanvasDimensions(format)

        const img = await fabric.FabricImage.fromURL(url, {
          crossOrigin: 'anonymous',
        })

        const maxWidth = width * 0.8
        const maxHeight = height * 0.8

        if (img.width && img.height) {
          const scaleX = maxWidth / img.width
          const scaleY = maxHeight / img.height
          const scale = Math.min(scaleX, scaleY, 1)
          img.scale(scale)
        }

        img.set({
          left: width / 2 - (img.getScaledWidth() || 0) / 2,
          top: height / 2 - (img.getScaledHeight() || 0) / 2,
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
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
          set({ isDirty: true })
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
            isDirty: true,
          })

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
            isDirty: true,
          })

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
        const { canvas, slides, hasWatermark, projectName, format } = get()
        if (!canvas) return

        const { jsPDF } = await import('jspdf')
        const { width, height } = getCanvasDimensions(format)

        const pdf = new jsPDF({
          orientation: width > height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [width, height],
        })

        get().saveCurrentSlide()

        let watermarkText: fabric.FabricText | null = null
        if (hasWatermark) {
          watermarkText = new fabric.FabricText('LinkedSel.de', {
            fontSize: 32,
            fontFamily: 'Inter, sans-serif',
            fill: 'rgba(0, 0, 0, 0.15)',
            left: width - 180,
            top: height - 60,
            selectable: false,
            evented: false,
          })
        }

        for (let i = 0; i < slides.length; i++) {
          if (i > 0) {
            pdf.addPage([width, height])
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

          pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)

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
          isDirty: true,
        })

        if (canvas && newSlides[0]) {
          canvas.clear()
          canvas.backgroundColor = newSlides[0].backgroundColor
          newSlides[0].objects.forEach((obj) => canvas.add(obj))
          canvas.renderAll()
        }
      },

      setProjectName: (name: string) => {
        set({ projectName: name, isDirty: true })
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
        set({ slides: updatedSlides, isDirty: true })
      },

      updateSelectedObject: (props: Record<string, unknown>) => {
        const { canvas, selectedObject } = get()
        if (!canvas || !selectedObject) return

        get().saveHistory()
        selectedObject.set(props)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
      },

      setSelectedObject: (obj: fabric.FabricObject | null) => {
        set({ selectedObject: obj })
      },

      // Z-Order functions
      bringToFront: () => {
        const { canvas, selectedObject } = get()
        if (!canvas || !selectedObject) return

        get().saveHistory()
        canvas.bringObjectToFront(selectedObject)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
      },

      sendToBack: () => {
        const { canvas, selectedObject } = get()
        if (!canvas || !selectedObject) return

        get().saveHistory()
        canvas.sendObjectToBack(selectedObject)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
      },

      bringForward: () => {
        const { canvas, selectedObject } = get()
        if (!canvas || !selectedObject) return

        get().saveHistory()
        canvas.bringObjectForward(selectedObject)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
      },

      sendBackward: () => {
        const { canvas, selectedObject } = get()
        if (!canvas || !selectedObject) return

        get().saveHistory()
        canvas.sendObjectBackwards(selectedObject)
        canvas.renderAll()
        get().saveCurrentSlide()
        set({ isDirty: true })
      },

      // Format
      setFormat: (format: FormatPreset) => {
        const { canvas } = get()
        const { width, height } = getCanvasDimensions(format)

        set({ format, isDirty: true })

        if (canvas) {
          canvas.setDimensions({
            width: width * DISPLAY_SCALE,
            height: height * DISPLAY_SCALE,
          })
          canvas.setZoom(DISPLAY_SCALE)
          canvas.renderAll()
        }
      },

      // Project persistence
      serializeProject: (): ProjectData => {
        const { slides, format } = get()
        get().saveCurrentSlide()

        const serializedSlides: SerializedSlide[] = slides.map((slide) => ({
          id: slide.id,
          backgroundColor: slide.backgroundColor,
          objects: slide.objects.map(serializeObject),
        }))

        return { format, slides: serializedSlides }
      },

      deserializeProject: async (data: ProjectData) => {
        const { canvas } = get()

        set({ format: data.format })

        const { width, height } = getCanvasDimensions(data.format)
        if (canvas) {
          canvas.setDimensions({
            width: width * DISPLAY_SCALE,
            height: height * DISPLAY_SCALE,
          })
          canvas.setZoom(DISPLAY_SCALE)
        }

        const newSlides: Slide[] = []

        for (const serializedSlide of data.slides) {
          const objects: fabric.FabricObject[] = []
          for (const serializedObj of serializedSlide.objects) {
            const obj = await deserializeObject(serializedObj)
            if (obj) objects.push(obj)
          }
          newSlides.push({
            id: serializedSlide.id,
            backgroundColor: serializedSlide.backgroundColor,
            objects,
          })
        }

        set({
          slides: newSlides.length > 0 ? newSlides : [createEmptySlide()],
          currentSlideIndex: 0,
          history: { past: [], future: [] },
          isDirty: false,
        })

        if (canvas && newSlides[0]) {
          canvas.clear()
          canvas.backgroundColor = newSlides[0].backgroundColor
          newSlides[0].objects.forEach((obj) => canvas.add(obj))
          canvas.renderAll()
        }
      },

      saveProject: async (): Promise<string | null> => {
        const { projectId, projectName, isSaving } = get()
        if (isSaving) return projectId

        set({ isSaving: true })

        try {
          const data = get().serializeProject()

          if (projectId) {
            // Update existing project
            const response = await fetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: projectName, data }),
            })

            if (!response.ok) throw new Error('Failed to save project')

            set({ isDirty: false, isSaving: false })
            return projectId
          } else {
            // Create new project
            const response = await fetch('/api/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: projectName, data }),
            })

            if (!response.ok) throw new Error('Failed to create project')

            const result = await response.json()
            const newId = result.project.id

            set({ projectId: newId, isDirty: false, isSaving: false })
            return newId
          }
        } catch (error) {
          console.error('Failed to save project:', error)
          set({ isSaving: false })
          return null
        }
      },

      loadProject: async (projectId: string): Promise<boolean> => {
        try {
          const response = await fetch(`/api/projects/${projectId}`)
          if (!response.ok) throw new Error('Failed to load project')

          const result = await response.json()
          const project = result.project

          set({
            projectId: project.id,
            projectName: project.name,
          })

          if (project.data && typeof project.data === 'object') {
            await get().deserializeProject(project.data as ProjectData)
          }

          return true
        } catch (error) {
          console.error('Failed to load project:', error)
          return false
        }
      },

      reset: () => {
        const { canvas, format } = get()
        const emptySlide = createEmptySlide()

        set({
          slides: [emptySlide],
          currentSlideIndex: 0,
          history: { past: [], future: [] },
          projectId: null,
          projectName: 'Neues Carousel',
          hasWatermark: true,
          selectedObject: null,
          isDirty: false,
        })

        if (canvas) {
          const { width, height } = getCanvasDimensions(format)
          canvas.setDimensions({
            width: width * DISPLAY_SCALE,
            height: height * DISPLAY_SCALE,
          })
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
