/**
 * Prompt for Step 5: Refinement
 * Fixes validation errors in generated layouts
 */

import type { SlideData } from '../carousel-schema'

export interface ValidationError {
  type: 'overlap' | 'out_of_bounds' | 'low_contrast' | 'missing_element'
  slideIndex: number
  elementIndex?: number
  message: string
  details?: Record<string, unknown>
}

export interface RefinementPromptContext {
  slide: SlideData
  slideIndex: number
  errors: ValidationError[]
  canvasWidth: number
  canvasHeight: number
  attempt: number
  maxAttempts: number
}

export function buildRefinementPrompt(context: RefinementPromptContext): {
  system: string
  user: string
} {
  const { slide, slideIndex, errors, canvasWidth, canvasHeight, attempt, maxAttempts } = context

  const system = `Du bist ein Layout-Korrektor für Social Media Carousels.
Deine Aufgabe ist es, Layout-Fehler zu beheben während der Stil erhalten bleibt.

CANVAS: ${canvasWidth}x${canvasHeight}px

FEHLERTYPEN:
- "overlap": Elemente überlappen sich. Verschiebe eines der Elemente.
- "out_of_bounds": Element ist außerhalb des Canvas. Passe Position/Größe an.
- "low_contrast": Text ist schlecht lesbar. Ändere Textfarbe oder Hintergrund.
- "missing_element": Erforderliches Element fehlt. Füge es hinzu.

REGELN:
1. Ändere NUR was nötig ist um den Fehler zu beheben
2. Behalte den Gesamtstil bei
3. Prüfe dass deine Korrektur keine neuen Fehler verursacht
4. Alle x, y, width, height Werte müssen >= 0 sein
5. Element-Positionen + Größen müssen im Canvas bleiben

Dies ist Versuch ${attempt} von ${maxAttempts}. Sei präzise.`

  const errorsText = errors
    .map(
      (e, i) =>
        `${i + 1}. [${e.type}] ${e.message}${e.details ? ` (${JSON.stringify(e.details)})` : ''}`
    )
    .join('\n')

  const user = `Korrigiere Slide ${slideIndex + 1}:

FEHLER:
${errorsText}

AKTUELLES LAYOUT:
${JSON.stringify(slide, null, 2)}

Gib das korrigierte Slide-Objekt zurück.`

  return { system, user }
}
