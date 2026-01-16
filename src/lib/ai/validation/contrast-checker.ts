/**
 * WCAG Contrast Checker
 * Calculates color contrast ratios for accessibility
 */

/**
 * Parse hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result || !result[1] || !result[2] || !result[3]) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const rs = toLinear(r)
  const gs = toLinear(g)
  const bs = toLinear(b)
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 1

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * WCAG Conformance Levels
 */
export type WCAGLevel = 'AAA' | 'AA' | 'AA-large' | 'fail'

/**
 * Check WCAG conformance level for text
 * @param contrastRatio - The contrast ratio
 * @param isLargeText - Whether the text is large (>=18pt or >=14pt bold)
 */
export function getWCAGLevel(contrastRatio: number, isLargeText: boolean = false): WCAGLevel {
  if (isLargeText) {
    if (contrastRatio >= 4.5) return 'AAA'
    if (contrastRatio >= 3) return 'AA'
    return 'fail'
  }
  if (contrastRatio >= 7) return 'AAA'
  if (contrastRatio >= 4.5) return 'AA'
  if (contrastRatio >= 3) return 'AA-large' // Only passes for large text
  return 'fail'
}

/**
 * Check if text color has sufficient contrast against background
 * @param textColor - Hex color of text
 * @param backgroundColor - Hex color of background
 * @param fontSize - Font size in pixels
 * @param fontWeight - Font weight (normal, medium, semibold, bold)
 */
export function hasSufficientContrast(
  textColor: string,
  backgroundColor: string,
  fontSize: number,
  fontWeight: string = 'normal'
): { passes: boolean; ratio: number; level: WCAGLevel } {
  const ratio = getContrastRatio(textColor, backgroundColor)

  // Large text is defined as 18pt (24px) or 14pt (18.67px) bold
  const isBold = ['bold', 'semibold', '600', '700'].includes(fontWeight)
  const isLargeText = fontSize >= 24 || (fontSize >= 18.67 && isBold)

  const level = getWCAGLevel(ratio, isLargeText)
  const passes = level !== 'fail'

  return { passes, ratio, level }
}

/**
 * Suggest a better text color for improved contrast
 * Returns white or black based on background luminance
 */
export function suggestTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return '#000000'

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  // If background is dark, use white text; otherwise use dark text
  return luminance > 0.179 ? '#1E293B' : '#F8FAFC'
}

/**
 * Darken or lighten a color by a percentage
 */
export function adjustColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const adjust = (value: number) => {
    const adjusted = Math.round(value + (255 - value) * (percent / 100))
    return Math.max(0, Math.min(255, adjusted))
  }

  if (percent < 0) {
    // Darken
    const factor = 1 + percent / 100
    const r = Math.round(rgb.r * factor)
    const g = Math.round(rgb.g * factor)
    const b = Math.round(rgb.b * factor)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  // Lighten
  const r = adjust(rgb.r)
  const g = adjust(rgb.g)
  const b = adjust(rgb.b)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
