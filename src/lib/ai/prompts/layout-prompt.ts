/**
 * Prompt for Step 3: Layout Generation
 * Generates precise element positions based on content and design system
 */

import type { SlideContent } from '../schemas/content-outline'
import type { DesignSystem } from '../schemas/design-system'

export interface LayoutPromptContext {
  slideContent: SlideContent
  slideIndex: number
  totalSlides: number
  designSystem: DesignSystem
  canvasWidth: number
  canvasHeight: number
}

/**
 * Generate dynamic layout examples based on canvas size
 */
function generateLayoutExamples(canvasWidth: number, canvasHeight: number): string {
  const padding = Math.round(canvasWidth * 0.06) // 6% padding
  const contentWidth = canvasWidth - padding * 2
  const centerX = padding // For full-width centered text, x starts at padding

  // Font sizes scaled to canvas
  const headlineFontSize = Math.round(canvasWidth * 0.05) // 5% of width
  const subheadlineFontSize = Math.round(canvasWidth * 0.032) // 3.2% of width
  const bodyFontSize = Math.round(canvasWidth * 0.028) // 2.8% of width
  const smallFontSize = Math.round(canvasWidth * 0.022) // 2.2% of width

  // Vertical positions
  const hookHeadlineY = Math.round(canvasHeight * 0.35) // 35% from top
  const hookSublineY = Math.round(canvasHeight * 0.48) // 48% from top
  const topHeadlineY = Math.round(canvasHeight * 0.08) // 8% from top
  const listStartY = Math.round(canvasHeight * 0.22) // 22% from top
  const listItemGap = Math.round(canvasHeight * 0.08) // 8% gap between items

  return `
BEISPIEL 1 - Hook Slide (vertikal zentriert):
Canvas: ${canvasWidth}x${canvasHeight}
{
  "backgroundColor": "#1E40AF",
  "elements": [
    {
      "type": "text",
      "text": "Arbeitest du hart oder smart?",
      "x": ${centerX},
      "y": ${hookHeadlineY},
      "width": ${contentWidth},
      "fontSize": ${headlineFontSize},
      "fontWeight": "bold",
      "color": "#FFFFFF",
      "textAlign": "center"
    },
    {
      "type": "text",
      "text": "5 Zeitmanagement-Strategien, die alles verändern",
      "x": ${centerX},
      "y": ${hookSublineY},
      "width": ${contentWidth},
      "fontSize": ${subheadlineFontSize},
      "fontWeight": "normal",
      "color": "#BFDBFE",
      "textAlign": "center"
    },
    {
      "type": "circle",
      "x": ${Math.round(canvasWidth * 0.85)},
      "y": ${Math.round(canvasHeight * 0.12)},
      "radius": ${Math.round(canvasWidth * 0.08)},
      "fill": "#3B82F6",
      "opacity": 0.3
    }
  ]
}

BEISPIEL 2 - List Slide (Headline oben, Liste darunter):
{
  "backgroundColor": "#FFFFFF",
  "elements": [
    {
      "type": "text",
      "text": "Die 4 Säulen der EQ",
      "x": ${padding},
      "y": ${topHeadlineY},
      "width": ${contentWidth},
      "fontSize": ${headlineFontSize},
      "fontWeight": "bold",
      "color": "#1E293B",
      "textAlign": "left"
    },
    {
      "type": "rectangle",
      "x": ${padding},
      "y": ${Math.round(canvasHeight * 0.16)},
      "width": ${Math.round(canvasWidth * 0.1)},
      "height": 4,
      "fill": "#1E40AF",
      "cornerRadius": 2,
      "opacity": 1
    },
    {
      "type": "text",
      "text": "• Selbstwahrnehmung - Eigene Emotionen erkennen",
      "x": ${padding},
      "y": ${listStartY},
      "width": ${contentWidth},
      "fontSize": ${bodyFontSize},
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "• Selbstregulation - Impulse kontrollieren",
      "x": ${padding},
      "y": ${listStartY + listItemGap},
      "width": ${contentWidth},
      "fontSize": ${bodyFontSize},
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "• Empathie - Andere verstehen",
      "x": ${padding},
      "y": ${listStartY + listItemGap * 2},
      "width": ${contentWidth},
      "fontSize": ${bodyFontSize},
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "• Soziale Kompetenz - Beziehungen pflegen",
      "x": ${padding},
      "y": ${listStartY + listItemGap * 3},
      "width": ${contentWidth},
      "fontSize": ${bodyFontSize},
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    }
  ]
}

BEISPIEL 3 - CTA Slide (zentriert mit Button):
{
  "backgroundColor": "#0F172A",
  "elements": [
    {
      "type": "text",
      "text": "Bereit für mehr Produktivität?",
      "x": ${centerX},
      "y": ${Math.round(canvasHeight * 0.28)},
      "width": ${contentWidth},
      "fontSize": ${headlineFontSize},
      "fontWeight": "bold",
      "color": "#F8FAFC",
      "textAlign": "center"
    },
    {
      "type": "text",
      "text": "Starte heute mit nur einer dieser Strategien.",
      "x": ${centerX},
      "y": ${Math.round(canvasHeight * 0.4)},
      "width": ${contentWidth},
      "fontSize": ${bodyFontSize},
      "fontWeight": "normal",
      "color": "#94A3B8",
      "textAlign": "center"
    },
    {
      "type": "rectangle",
      "x": ${Math.round(canvasWidth * 0.25)},
      "y": ${Math.round(canvasHeight * 0.55)},
      "width": ${Math.round(canvasWidth * 0.5)},
      "height": ${Math.round(canvasHeight * 0.06)},
      "fill": "#7C3AED",
      "cornerRadius": ${Math.round(canvasHeight * 0.03)},
      "opacity": 1
    },
    {
      "type": "text",
      "text": "Folge für mehr Tipps",
      "x": ${Math.round(canvasWidth * 0.25)},
      "y": ${Math.round(canvasHeight * 0.565)},
      "width": ${Math.round(canvasWidth * 0.5)},
      "fontSize": ${smallFontSize},
      "fontWeight": "600",
      "color": "#FFFFFF",
      "textAlign": "center"
    }
  ]
}

BEISPIEL 4 - Quote Slide:
{
  "backgroundColor": "#F1F5F9",
  "elements": [
    {
      "type": "text",
      "text": "❝",
      "x": ${padding},
      "y": ${Math.round(canvasHeight * 0.12)},
      "width": ${Math.round(canvasWidth * 0.15)},
      "fontSize": ${Math.round(canvasWidth * 0.12)},
      "fontWeight": "bold",
      "color": "#1E40AF",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "90% der Top-Performer haben eine überdurchschnittliche emotionale Intelligenz.",
      "x": ${padding},
      "y": ${Math.round(canvasHeight * 0.3)},
      "width": ${contentWidth},
      "fontSize": ${Math.round(canvasWidth * 0.038)},
      "fontWeight": "500",
      "color": "#1E293B",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "— TalentSmart Studie",
      "x": ${padding},
      "y": ${Math.round(canvasHeight * 0.52)},
      "width": ${contentWidth},
      "fontSize": ${smallFontSize},
      "fontWeight": "normal",
      "color": "#64748B",
      "textAlign": "left"
    }
  ]
}`
}

export function buildLayoutPrompt(context: LayoutPromptContext): {
  system: string
  user: string
} {
  const { slideContent, slideIndex, totalSlides, designSystem, canvasWidth, canvasHeight } = context
  const { colors, typography, spacing, decorative } = designSystem

  // Calculate recommended sizes based on canvas
  const padding = Math.round(canvasWidth * 0.06)
  const contentWidth = canvasWidth - padding * 2
  const recommendedHeadline = Math.round(canvasWidth * 0.05)
  const recommendedBody = Math.round(canvasWidth * 0.028)

  const layoutExamples = generateLayoutExamples(canvasWidth, canvasHeight)

  const system = `Du bist ein Layout-Designer für Social Media Carousels.
Deine Aufgabe ist es, präzise Positionen für alle Elemente eines Slides zu berechnen.

CANVAS: ${canvasWidth}x${canvasHeight}px

BERECHNETE WERTE FÜR DIESEN CANVAS:
- Padding: ${padding}px (6% von Breite)
- Content-Breite: ${contentWidth}px (Canvas minus Padding)
- Empfohlene Headline: ${recommendedHeadline}px (5% von Breite)
- Empfohlene Body-Schrift: ${recommendedBody}px (2.8% von Breite)

DESIGN SYSTEM:
- Farben: Primary ${colors.primary}, Secondary ${colors.secondary}, Background ${colors.background}, Text ${colors.text}
- Typography: Headline ${typography.headline.size}px ${typography.headline.weight}, Body ${typography.body.size}px
- Spacing: Padding ${spacing.paddingHorizontal}px horizontal, ${spacing.paddingVertical}px vertical, Gap ${spacing.elementGap}px
- Decorative: ${decorative.useShapes ? `Shapes (${decorative.shapeStyle}, Opacity ${decorative.opacity})` : 'Keine Shapes'}

LAYOUT-REGELN:
1. Text MUSS innerhalb des Canvas bleiben: x >= ${padding}, x + width <= ${canvasWidth - padding}
2. Vertikale Grenzen beachten: y >= ${padding}, Elemente nicht unter ${canvasHeight - padding}
3. Zentrierte Headlines bei hook/cta Slides: x = ${padding}, width = ${contentWidth}, textAlign: "center"
4. Links-ausgerichtete Headlines bei content/list Slides: x = ${padding}, textAlign: "left"
5. Font-Größen skaliert zur Canvas-Größe verwenden (siehe Beispiele)
6. Bei Listen: Jeden Bullet als separates Text-Element mit • Prefix
7. Vertikaler Abstand zwischen Elementen: mindestens ${Math.round(canvasHeight * 0.04)}px

ELEMENT-TYPEN (alle Felder müssen gesetzt sein, nicht benötigte als null):
- "text": text, x, y, width, fontSize, fontWeight, color, textAlign (+ null für: height, fill, cornerRadius, radius, opacity)
- "rectangle": x, y, width, height, fill, cornerRadius, opacity (+ null für: text, fontSize, fontWeight, color, textAlign, radius)
- "circle": x (Zentrum), y (Zentrum), radius, fill, opacity (+ null für: text, width, height, fontSize, fontWeight, color, textAlign, cornerRadius)

WICHTIG:
- Alle Positionen sind ABSOLUTE Pixel-Werte
- Hook/CTA Slides: Text vertikal zentrieren (y ca. ${Math.round(canvasHeight * 0.35)} für Headline)
- List Slides: Headline oben (y ca. ${Math.round(canvasHeight * 0.08)}), dann Liste ab ${Math.round(canvasHeight * 0.22)}
- Kontrastreiche Farben für Text auf Background

${layoutExamples}`

  const slideTypeDescription = {
    hook: 'Aufmerksamkeit erregend, zentriert, impactvoll',
    content: 'Informativ, Headline oben, Body darunter',
    list: 'Strukturiert, Headline + Bullet-Liste',
    quote: 'Groß, emotional, mit Anführungszeichen',
    cta: 'Handlungsaufforderung, Button-artig, zentriert',
  }

  const contentJson = JSON.stringify(slideContent, null, 2)

  const user = `Erstelle das Layout für Slide ${slideIndex + 1} von ${totalSlides}.

SLIDE-TYP: ${slideContent.type} (${slideTypeDescription[slideContent.type]})

CONTENT:
${contentJson}

Generiere ein vollständiges Slide-Objekt mit backgroundColor und elements Array.`

  return { system, user }
}
