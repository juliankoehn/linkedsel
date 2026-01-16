/**
 * Carousel Validator
 * Validates generated carousel layouts for quality and consistency
 */

import type { CarouselData, ElementData, SlideData } from '../carousel-schema'
import type { ValidationError } from '../prompts/refinement-prompt'
import { hasSufficientContrast, suggestTextColor } from './contrast-checker'
import { findTextOverlaps, isWithinBounds } from './overlap-detector'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationWarning {
  type: string
  slideIndex: number
  message: string
}

export interface ValidationOptions {
  canvasWidth: number
  canvasHeight: number
  strictMode?: boolean // For premium quality
  minTextElements?: number // Minimum text elements per slide
}

/**
 * Validate a single slide
 */
export function validateSlide(
  slide: SlideData,
  slideIndex: number,
  options: ValidationOptions
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const { canvasWidth, canvasHeight, strictMode = false, minTextElements = 1 } = options

  // 1. Check for minimum text elements
  const textElements = slide.elements.filter((el) => el.type === 'text')
  if (textElements.length < minTextElements) {
    errors.push({
      type: 'missing_element',
      slideIndex,
      message: `Slide has ${textElements.length} text element(s), minimum is ${minTextElements}`,
      details: { actual: textElements.length, required: minTextElements },
    })
  }

  // 2. Check each element
  slide.elements.forEach((element, elementIndex) => {
    // Check bounds
    const boundsCheck = isWithinBounds(element, canvasWidth, canvasHeight)
    if (!boundsCheck.withinBounds) {
      errors.push({
        type: 'out_of_bounds',
        slideIndex,
        elementIndex,
        message: `Element ${elementIndex} is out of bounds: ${boundsCheck.violations.join(', ')}`,
        details: {
          element: element.type,
          x: element.x,
          y: element.y,
          violations: boundsCheck.violations,
        },
      })
    }

    // Check text contrast
    if (element.type === 'text') {
      const textEl = element as ElementData & { type: 'text' }
      const contrastCheck = hasSufficientContrast(
        textEl.color,
        slide.backgroundColor,
        textEl.fontSize,
        textEl.fontWeight
      )

      if (!contrastCheck.passes) {
        const suggestedColor = suggestTextColor(slide.backgroundColor)
        errors.push({
          type: 'low_contrast',
          slideIndex,
          elementIndex,
          message: `Text has insufficient contrast (ratio: ${contrastCheck.ratio.toFixed(2)})`,
          details: {
            textColor: textEl.color,
            backgroundColor: slide.backgroundColor,
            ratio: contrastCheck.ratio,
            suggestedColor,
          },
        })
      } else if (strictMode && contrastCheck.level === 'AA-large') {
        // In strict mode, warn about AA-large (only passes for large text)
        warnings.push({
          type: 'contrast_warning',
          slideIndex,
          message: `Text contrast could be improved (level: ${contrastCheck.level})`,
        })
      }
    }
  })

  // 3. Check for text overlaps
  const overlaps = findTextOverlaps(slide.elements)
  for (const overlap of overlaps) {
    errors.push({
      type: 'overlap',
      slideIndex,
      message: `Text elements ${overlap.index1} and ${overlap.index2} overlap by ${overlap.overlapPercent.toFixed(1)}%`,
      details: {
        element1Index: overlap.index1,
        element2Index: overlap.index2,
        overlapPercent: overlap.overlapPercent,
      },
    })
  }

  // 4. Strict mode additional checks
  if (strictMode) {
    // Check text width is reasonable
    textElements.forEach((el, idx) => {
      if (el.type === 'text') {
        const maxWidth = canvasWidth - 80 // Minimum 40px padding each side
        if (el.width > maxWidth) {
          warnings.push({
            type: 'text_too_wide',
            slideIndex,
            message: `Text element ${idx} width (${el.width}px) exceeds recommended max (${maxWidth}px)`,
          })
        }

        // Check for very small text
        if (el.fontSize < 16) {
          warnings.push({
            type: 'text_too_small',
            slideIndex,
            message: `Text element ${idx} font size (${el.fontSize}px) is below recommended minimum (16px)`,
          })
        }
      }
    })
  }

  return { errors, warnings }
}

/**
 * Validate an entire carousel
 */
export function validateCarousel(
  carousel: CarouselData,
  options: ValidationOptions
): ValidationResult {
  const allErrors: ValidationError[] = []
  const allWarnings: ValidationWarning[] = []

  // Validate each slide
  carousel.slides.forEach((slide, index) => {
    const { errors, warnings } = validateSlide(slide, index, options)
    allErrors.push(...errors)
    allWarnings.push(...warnings)
  })

  // Check carousel-level issues
  if (carousel.slides.length === 0) {
    allErrors.push({
      type: 'missing_element',
      slideIndex: -1,
      message: 'Carousel has no slides',
    })
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
}

/**
 * Get errors for a specific slide
 */
export function getSlideErrors(result: ValidationResult, slideIndex: number): ValidationError[] {
  return result.errors.filter((e) => e.slideIndex === slideIndex)
}

/**
 * Check if a specific slide is valid
 */
export function isSlideValid(result: ValidationResult, slideIndex: number): boolean {
  return getSlideErrors(result, slideIndex).length === 0
}

/**
 * Get invalid slide indices
 */
export function getInvalidSlideIndices(result: ValidationResult): number[] {
  const indices = new Set<number>()
  result.errors.forEach((e) => {
    if (e.slideIndex >= 0) {
      indices.add(e.slideIndex)
    }
  })
  return Array.from(indices).sort((a, b) => a - b)
}
