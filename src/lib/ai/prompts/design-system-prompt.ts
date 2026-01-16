/**
 * Prompt for Step 2: Design System Generation
 * Includes few-shot examples for consistent design
 */

import type { BrandKit } from '@/types/brand-kit'

export interface DesignSystemPromptContext {
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
  brandKit?: BrandKit | null
  canvasWidth: number
  canvasHeight: number
}

const styleDesignGuidelines = {
  professional: {
    colors:
      'Verwende gedämpfte, seriöse Farben. Primärfarbe sollte Vertrauen ausstrahlen (Blau, Dunkelgrün, Dunkelgrau). Hoher Kontrast für Lesbarkeit.',
    typography:
      'Große Headlines (56-64px), klare Hierarchie. Body-Text gut lesbar (22-26px). Semibold für Betonung.',
    spacing: 'Großzügige Abstände. Minimum 60px Padding. Viel Whitespace für professionellen Look.',
    decorative: 'Minimale Dekoration. Wenn Shapes, dann geometrisch und subtil. Niedrige Opazität.',
  },
  casual: {
    colors: 'Warme, freundliche Farben. Kann verspielter sein. Akzentfarben für Highlights.',
    typography:
      'Headlines können größer und expressiver sein (52-60px). Body entspannt lesbar (24-28px).',
    spacing: 'Moderate Abstände (50-70px). Nicht zu steif.',
    decorative: 'Mehr Dekoration erlaubt. Organische oder bold Shapes. Mittlere Opazität.',
  },
  educational: {
    colors:
      'Klare, gut lesbare Farbkombinationen. Sekundärfarbe für Hervorhebungen. Guter Kontrast essentiell.',
    typography: 'Fokus auf Lesbarkeit. Headlines 52-58px. Body 24-28px mit guter Zeilenhöhe.',
    spacing: 'Strukturierte Abstände. Konsistente Gaps zwischen Elementen.',
    decorative:
      'Geometrische Shapes zur Strukturierung. Können Nummerierungen oder Schritte visualisieren.',
  },
  inspirational: {
    colors: 'Mutige, emotionale Farben. Starke Kontraste. Akzentfarben die Energie vermitteln.',
    typography: 'Große, impactvolle Headlines (60-72px). Bold weights. Body kann kompakter sein.',
    spacing: 'Kann enger sein für Impact. Aber Headlines brauchen Raum zum Atmen.',
    decorative: 'Bold Shapes erlaubt. Höhere Opazität. Können dominant sein.',
  },
}

const fewShotExample = `
BEISPIEL - Professional Style mit Brand Kit (Blau/Weiß):
{
  "colors": {
    "primary": "#1E40AF",
    "secondary": "#3B82F6",
    "background": "#FFFFFF",
    "backgroundAlt": "#F1F5F9",
    "text": "#1E293B",
    "textMuted": "#64748B",
    "accent": "#F59E0B"
  },
  "typography": {
    "headline": { "size": 56, "weight": "bold", "lineHeight": 1.1 },
    "subheadline": { "size": 32, "weight": "semibold", "lineHeight": 1.2 },
    "body": { "size": 24, "weight": "normal", "lineHeight": 1.5 },
    "caption": { "size": 18, "weight": "normal", "lineHeight": 1.4 }
  },
  "spacing": {
    "paddingHorizontal": 60,
    "paddingVertical": 60,
    "elementGap": 24,
    "sectionGap": 40
  },
  "decorative": {
    "useShapes": true,
    "shapeStyle": "geometric",
    "cornerRadius": 12,
    "opacity": 0.15
  }
}

BEISPIEL - Inspirational Style ohne Brand Kit:
{
  "colors": {
    "primary": "#7C3AED",
    "secondary": "#EC4899",
    "background": "#0F172A",
    "backgroundAlt": "#1E293B",
    "text": "#F8FAFC",
    "textMuted": "#94A3B8",
    "accent": "#FBBF24"
  },
  "typography": {
    "headline": { "size": 64, "weight": "bold", "lineHeight": 1.05 },
    "subheadline": { "size": 36, "weight": "semibold", "lineHeight": 1.15 },
    "body": { "size": 26, "weight": "normal", "lineHeight": 1.4 },
    "caption": { "size": 20, "weight": "medium", "lineHeight": 1.3 }
  },
  "spacing": {
    "paddingHorizontal": 50,
    "paddingVertical": 50,
    "elementGap": 20,
    "sectionGap": 36
  },
  "decorative": {
    "useShapes": true,
    "shapeStyle": "bold",
    "cornerRadius": 24,
    "opacity": 0.4
  }
}`

export function buildDesignSystemPrompt(context: DesignSystemPromptContext): {
  system: string
  user: string
} {
  const { style, brandKit, canvasWidth, canvasHeight } = context
  const guidelines = styleDesignGuidelines[style]

  let brandKitContext = ''
  if (brandKit) {
    const colors = brandKit.colors.map((c) => `${c.name}: ${c.hex}`).join(', ')
    const fonts = brandKit.fonts.map((f) => `${f.name}: ${f.family} (${f.weight})`).join(', ')
    brandKitContext = `
BRAND KIT VORGABEN (MÜSSEN verwendet werden):
- Farben: ${colors}
- Fonts: ${fonts}
Passe das Design System an diese Brand-Farben an. Die primary und secondary Farben sollten aus dem Brand Kit stammen.`
  }

  const system = `Du bist ein erfahrener UI/UX Designer spezialisiert auf Social Media Carousels.
Deine Aufgabe ist es, ein konsistentes Design System zu erstellen, das visuell ansprechend und gut lesbar ist.

CANVAS GRÖSSE: ${canvasWidth}x${canvasHeight}px

STIL-RICHTLINIEN FÜR "${style.toUpperCase()}":
- Farben: ${guidelines.colors}
- Typography: ${guidelines.typography}
- Spacing: ${guidelines.spacing}
- Decorative: ${guidelines.decorative}
${brandKitContext}

WICHTIGE REGELN:
1. Kontrast: Text MUSS gut lesbar sein. Bei dunklem Hintergrund → heller Text. Bei hellem Hintergrund → dunkler Text.
2. Alle Farben in HEX-Format (#RRGGBB)
3. Typography-Größen in Pixel
4. Spacing-Werte angepasst an Canvas-Größe
5. Font Weights: "normal" (400), "medium" (500), "semibold" (600), "bold" (700)

${fewShotExample}`

  const user = brandKit
    ? `Erstelle ein Design System für den Stil "${style}" unter Verwendung des Brand Kits.`
    : `Erstelle ein Design System für den Stil "${style}".`

  return { system, user }
}
