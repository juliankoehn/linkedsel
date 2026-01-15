'use client'

import * as fabric from 'fabric'

import { useSubscription } from '@/hooks/use-subscription'
import { FORMAT_PRESETS, useEditorStore } from '@/stores/editor'

const DISPLAY_SCALE = 0.4

/**
 * Hook for PDF export with subscription-based watermark enforcement.
 * Free users always get watermarks, paid users can disable them.
 */
export function useExport() {
  const { hasSubscription } = useSubscription()

  const exportPDF = async () => {
    const state = useEditorStore.getState()
    const { canvas, slides, projectName, format } = state

    if (!canvas) return

    const { jsPDF } = await import('jspdf')
    const preset = FORMAT_PRESETS[format]
    const width = preset.width
    const height = preset.height

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    })

    state.saveCurrentSlide()

    // IMPORTANT: Free users ALWAYS get watermarks
    // Only paid users can disable watermarks
    const shouldShowWatermark = !hasSubscription || state.hasWatermark

    let watermarkText: fabric.FabricText | null = null
    if (shouldShowWatermark) {
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

    // Restore current slide
    const currentSlideIndex = state.currentSlideIndex
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
  }

  return {
    exportPDF,
    canDisableWatermark: hasSubscription,
  }
}
