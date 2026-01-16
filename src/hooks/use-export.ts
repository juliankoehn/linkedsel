'use client'

import type Konva from 'konva'

import { useSubscription } from '@/hooks/use-subscription'
import { FORMAT_PRESETS, useCanvasStore } from '@/stores/canvas-store'
import { useProjectStore } from '@/stores/project-store'
import { type CanvasElement, useSlidesStore } from '@/stores/slides-store'

/**
 * Hook for PDF export with subscription-based watermark enforcement.
 * Free users always get watermarks, paid users can disable them.
 */
export function useExport() {
  const { hasSubscription } = useSubscription()

  const exportPDF = async () => {
    const { format } = useCanvasStore.getState()
    const { slides } = useSlidesStore.getState()
    const { name, hasWatermark } = useProjectStore.getState()

    // Dynamic imports to avoid SSR issues
    const [{ jsPDF }, KonvaModule] = await Promise.all([import('jspdf'), import('konva')])
    const Konva = KonvaModule.default

    const preset = FORMAT_PRESETS[format]
    const width = preset.width
    const height = preset.height

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    })

    // IMPORTANT: Free users ALWAYS get watermarks
    // Only paid users can disable watermarks
    const shouldShowWatermark = !hasSubscription || hasWatermark

    // Create a temporary container for rendering
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    document.body.appendChild(container)

    try {
      for (let i = 0; i < slides.length; i++) {
        if (i > 0) {
          pdf.addPage([width, height])
        }

        const slide = slides[i]
        if (!slide) continue

        // Create a stage for this slide
        const stage = new Konva.Stage({
          container,
          width,
          height,
        })

        const layer = new Konva.Layer()
        stage.add(layer)

        // Background color
        const background = new Konva.Rect({
          x: 0,
          y: 0,
          width,
          height,
          fill: slide.backgroundColor,
        })
        layer.add(background)

        // Background image (if present)
        if (slide.backgroundImage) {
          const bgImageData = slide.backgroundImage
          await new Promise<void>((resolve) => {
            const bgImageObj = new window.Image()
            bgImageObj.crossOrigin = 'anonymous'
            bgImageObj.onload = () => {
              // Add the background image
              const bgImage = new Konva.Image({
                x: 0,
                y: 0,
                width,
                height,
                image: bgImageObj,
                opacity: bgImageData.opacity ?? 1,
              })
              layer.add(bgImage)

              // Add overlay if specified
              if (bgImageData.overlay) {
                const overlay = new Konva.Rect({
                  x: 0,
                  y: 0,
                  width,
                  height,
                  fill: bgImageData.overlay,
                })
                layer.add(overlay)
              }
              resolve()
            }
            bgImageObj.onerror = () => {
              console.warn('Failed to load background image:', bgImageData.src)
              resolve()
            }
            bgImageObj.src = bgImageData.src
          })
        }

        // Render elements
        await renderSlideElements(layer, slide.elements, Konva)

        // Add watermark if needed
        if (shouldShowWatermark) {
          const watermark = new Konva.Text({
            text: 'LinkedSel.de',
            fontSize: 32,
            fontFamily: 'Inter, sans-serif',
            fill: 'rgba(0, 0, 0, 0.15)',
            x: width - 180,
            y: height - 60,
          })
          layer.add(watermark)
        }

        layer.draw()

        // Export to data URL
        const dataUrl = stage.toDataURL({
          pixelRatio: 1,
          mimeType: 'image/png',
        })

        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)

        // Clean up
        stage.destroy()
      }

      const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      pdf.save(filename)
    } finally {
      document.body.removeChild(container)
    }
  }

  return {
    exportPDF,
    canDisableWatermark: hasSubscription,
  }
}

// Helper to render elements with async image loading
async function renderSlideElements(
  layer: Konva.Layer,
  elements: CanvasElement[],
  Konva: typeof import('konva').default
): Promise<void> {
  const imagePromises: Promise<void>[] = []

  for (const element of elements) {
    if (!element.visible) continue

    switch (element.type) {
      case 'text': {
        const text = new Konva.Text({
          x: element.x,
          y: element.y,
          width: element.width,
          text: element.text,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fontStyle: `${element.fontWeight} ${element.fontStyle}`,
          fill: element.fill,
          align: element.textAlign,
          opacity: element.opacity,
          rotation: element.rotation,
        })
        layer.add(text)
        break
      }
      case 'rect': {
        const rect = new Konva.Rect({
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          cornerRadius: element.cornerRadius,
          opacity: element.opacity,
          rotation: element.rotation,
        })
        layer.add(rect)
        break
      }
      case 'circle': {
        const circle = new Konva.Circle({
          x: element.x + element.radius,
          y: element.y + element.radius,
          radius: element.radius,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          opacity: element.opacity,
          rotation: element.rotation,
        })
        layer.add(circle)
        break
      }
      case 'image': {
        const promise = new Promise<void>((resolve) => {
          const imageObj = new window.Image()
          imageObj.crossOrigin = 'anonymous'
          imageObj.onload = () => {
            const img = new Konva.Image({
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              image: imageObj,
              opacity: element.opacity,
              rotation: element.rotation,
            })
            layer.add(img)
            resolve()
          }
          imageObj.onerror = () => {
            // On error, add a placeholder
            const placeholder = new Konva.Rect({
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              fill: '#f0f0f0',
              stroke: '#e0e0e0',
              strokeWidth: 1,
            })
            layer.add(placeholder)
            resolve()
          }
          imageObj.src = element.src
        })
        imagePromises.push(promise)
        break
      }
    }
  }

  // Wait for all images to load
  await Promise.all(imagePromises)
}
