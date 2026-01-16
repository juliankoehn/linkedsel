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

const layoutExamples = `
BEISPIEL 1 - Hook Slide (zentriert):
{
  "backgroundColor": "#1E40AF",
  "elements": [
    {
      "type": "text",
      "text": "Arbeitest du hart oder smart?",
      "x": 60,
      "y": 280,
      "width": 680,
      "fontSize": 56,
      "fontWeight": "bold",
      "color": "#FFFFFF",
      "textAlign": "center"
    },
    {
      "type": "text",
      "text": "5 Zeitmanagement-Strategien, die alles verändern",
      "x": 60,
      "y": 370,
      "width": 680,
      "fontSize": 28,
      "fontWeight": "normal",
      "color": "#BFDBFE",
      "textAlign": "center"
    },
    {
      "type": "circle",
      "x": 680,
      "y": 100,
      "radius": 60,
      "fill": "#3B82F6",
      "opacity": 0.3
    },
    {
      "type": "rectangle",
      "x": 40,
      "y": 700,
      "width": 200,
      "height": 8,
      "fill": "#F59E0B",
      "cornerRadius": 4,
      "opacity": 1
    }
  ]
}

BEISPIEL 2 - List Slide (mit Bullets):
{
  "backgroundColor": "#FFFFFF",
  "elements": [
    {
      "type": "text",
      "text": "Die 4 Säulen der EQ",
      "x": 60,
      "y": 80,
      "width": 680,
      "fontSize": 48,
      "fontWeight": "bold",
      "color": "#1E293B",
      "textAlign": "left"
    },
    {
      "type": "rectangle",
      "x": 60,
      "y": 160,
      "width": 80,
      "height": 4,
      "fill": "#1E40AF",
      "cornerRadius": 2,
      "opacity": 1
    },
    {
      "type": "text",
      "text": "• Selbstwahrnehmung - Eigene Emotionen erkennen",
      "x": 60,
      "y": 220,
      "width": 680,
      "fontSize": 26,
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "• Selbstregulation - Impulse kontrollieren",
      "x": 60,
      "y": 300,
      "width": 680,
      "fontSize": 26,
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "• Empathie - Andere verstehen",
      "x": 60,
      "y": 380,
      "width": 680,
      "fontSize": 26,
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "• Soziale Kompetenz - Beziehungen pflegen",
      "x": 60,
      "y": 460,
      "width": 680,
      "fontSize": 26,
      "fontWeight": "normal",
      "color": "#334155",
      "textAlign": "left"
    }
  ]
}

BEISPIEL 3 - CTA Slide:
{
  "backgroundColor": "#0F172A",
  "elements": [
    {
      "type": "text",
      "text": "Bereit für mehr Produktivität?",
      "x": 60,
      "y": 200,
      "width": 680,
      "fontSize": 52,
      "fontWeight": "bold",
      "color": "#F8FAFC",
      "textAlign": "center"
    },
    {
      "type": "text",
      "text": "Starte heute mit nur einer dieser Strategien.",
      "x": 60,
      "y": 300,
      "width": 680,
      "fontSize": 26,
      "fontWeight": "normal",
      "color": "#94A3B8",
      "textAlign": "center"
    },
    {
      "type": "rectangle",
      "x": 220,
      "y": 420,
      "width": 360,
      "height": 60,
      "fill": "#7C3AED",
      "cornerRadius": 30,
      "opacity": 1
    },
    {
      "type": "text",
      "text": "Folge für mehr Tipps",
      "x": 220,
      "y": 435,
      "width": 360,
      "fontSize": 22,
      "fontWeight": "semibold",
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
      "x": 60,
      "y": 120,
      "width": 100,
      "fontSize": 120,
      "fontWeight": "bold",
      "color": "#1E40AF",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "90% der Top-Performer haben eine überdurchschnittliche emotionale Intelligenz.",
      "x": 60,
      "y": 260,
      "width": 680,
      "fontSize": 36,
      "fontWeight": "medium",
      "color": "#1E293B",
      "textAlign": "left"
    },
    {
      "type": "text",
      "text": "— TalentSmart Studie",
      "x": 60,
      "y": 420,
      "width": 680,
      "fontSize": 22,
      "fontWeight": "normal",
      "color": "#64748B",
      "textAlign": "left"
    }
  ]
}`

export function buildLayoutPrompt(context: LayoutPromptContext): {
  system: string
  user: string
} {
  const { slideContent, slideIndex, totalSlides, designSystem, canvasWidth, canvasHeight } = context
  const { colors, typography, spacing, decorative } = designSystem

  const system = `Du bist ein Layout-Designer für Social Media Carousels.
Deine Aufgabe ist es, präzise Positionen für alle Elemente eines Slides zu berechnen.

CANVAS: ${canvasWidth}x${canvasHeight}px

DESIGN SYSTEM:
- Farben: Primary ${colors.primary}, Secondary ${colors.secondary}, Background ${colors.background}, Text ${colors.text}
- Typography: Headline ${typography.headline.size}px ${typography.headline.weight}, Body ${typography.body.size}px
- Spacing: Padding ${spacing.paddingHorizontal}px horizontal, ${spacing.paddingVertical}px vertical, Gap ${spacing.elementGap}px
- Decorative: ${decorative.useShapes ? `Shapes (${decorative.shapeStyle}, Opacity ${decorative.opacity})` : 'Keine Shapes'}

LAYOUT-REGELN:
1. Text MUSS innerhalb des Canvas bleiben (x + width <= ${canvasWidth - spacing.paddingHorizontal})
2. Verwende das Spacing aus dem Design System
3. Zentrierte Headlines bei hook/cta Slides (textAlign: "center", x so dass Text zentriert ist)
4. Links-ausgerichtete Headlines bei content/list Slides
5. Background-Farbe sollte zwischen background und backgroundAlt variieren
6. Bei Listen: Jeden Bullet als separates Text-Element mit • Prefix
7. Dekorative Shapes: Dezent platzieren (Ecken, unter/über Text)

ELEMENT-TYPEN:
- "text": Für alle Texte. Benötigt: text, x, y, width, fontSize, fontWeight, color, textAlign
- "rectangle": Für Rechtecke. Benötigt: x, y, width, height, fill, cornerRadius, opacity
- "circle": Für Kreise. Benötigt: x (Zentrum), y (Zentrum), radius, fill, opacity

WICHTIG:
- Prüfe dass alle Elemente im Canvas sind
- Keine Überlappungen von Text-Elementen
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
