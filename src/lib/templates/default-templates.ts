import type { CarouselTemplate } from '@/types/templates'

// Canvas dimensions
const W = 1080
const H = 1350

export const DEFAULT_TEMPLATES: CarouselTemplate[] = [
  {
    id: 'minimal-tips',
    name: '5 Tipps',
    description: 'Minimalistisches Design für Tipps & Listen',
    category: 'minimal',
    isPremium: false,
    thumbnailUrl: '/templates/minimal-tips.svg',
    colors: ['#000000', '#ffffff', '#f3f4f6'],
    slides: [
      {
        id: 'cover',
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'text',
            props: {
              text: '5 TIPPS',
              left: W / 2,
              top: 500,
              fontSize: 120,
              fontFamily: 'Inter',
              fill: '#000000',
              fontWeight: 'bold',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            props: {
              text: 'für mehr Produktivität',
              left: W / 2,
              top: 650,
              fontSize: 48,
              fontFamily: 'Inter',
              fill: '#6b7280',
              textAlign: 'center',
            },
          },
          {
            type: 'shape',
            props: {
              shape: 'rect',
              left: W / 2 - 60,
              top: 800,
              width: 120,
              height: 4,
              fill: '#000000',
            },
          },
        ],
      },
      {
        id: 'tip-1',
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'text',
            props: {
              text: '01',
              left: 80,
              top: 100,
              fontSize: 200,
              fontFamily: 'Inter',
              fill: '#f3f4f6',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Tipp Titel',
              left: 80,
              top: 400,
              fontSize: 64,
              fontFamily: 'Inter',
              fill: '#000000',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Beschreibe hier deinen ersten Tipp ausführlich. Was sollen die Leser mitnehmen?',
              left: 80,
              top: 500,
              fontSize: 36,
              fontFamily: 'Inter',
              fill: '#6b7280',
              width: W - 160,
            },
          },
        ],
      },
      {
        id: 'tip-2',
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'text',
            props: {
              text: '02',
              left: 80,
              top: 100,
              fontSize: 200,
              fontFamily: 'Inter',
              fill: '#f3f4f6',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Tipp Titel',
              left: 80,
              top: 400,
              fontSize: 64,
              fontFamily: 'Inter',
              fill: '#000000',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Beschreibe hier deinen zweiten Tipp ausführlich.',
              left: 80,
              top: 500,
              fontSize: 36,
              fontFamily: 'Inter',
              fill: '#6b7280',
              width: W - 160,
            },
          },
        ],
      },
      {
        id: 'cta',
        backgroundColor: '#000000',
        elements: [
          {
            type: 'text',
            props: {
              text: 'FOLGE MIR',
              left: W / 2,
              top: 550,
              fontSize: 72,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            props: {
              text: 'für mehr Tipps',
              left: W / 2,
              top: 650,
              fontSize: 36,
              fontFamily: 'Inter',
              fill: '#9ca3af',
              textAlign: 'center',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'bold-statement',
    name: 'Bold Statement',
    description: 'Kraftvolle Aussagen mit starkem Kontrast',
    category: 'bold',
    isPremium: false,
    thumbnailUrl: '/templates/bold-statement.svg',
    colors: ['#1e40af', '#ffffff', '#fbbf24'],
    slides: [
      {
        id: 'cover',
        backgroundColor: '#1e40af',
        elements: [
          {
            type: 'text',
            props: {
              text: 'DAS MUSST DU WISSEN',
              left: W / 2,
              top: 550,
              fontSize: 72,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
              width: W - 160,
            },
          },
          {
            type: 'shape',
            props: {
              shape: 'rect',
              left: W / 2 - 100,
              top: 700,
              width: 200,
              height: 8,
              fill: '#fbbf24',
            },
          },
        ],
      },
      {
        id: 'point-1',
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'rect',
              left: 0,
              top: 0,
              width: 20,
              height: H,
              fill: '#1e40af',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Wichtiger Punkt',
              left: 100,
              top: 300,
              fontSize: 64,
              fontFamily: 'Inter',
              fill: '#1e40af',
              fontWeight: 'bold',
              width: W - 200,
            },
          },
          {
            type: 'text',
            props: {
              text: 'Erkläre hier den wichtigsten Aspekt deines Themas. Nutze klare und prägnante Sprache.',
              left: 100,
              top: 420,
              fontSize: 36,
              fontFamily: 'Inter',
              fill: '#374151',
              width: W - 200,
            },
          },
        ],
      },
      {
        id: 'cta',
        backgroundColor: '#1e40af',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'circle',
              left: W / 2 - 80,
              top: 400,
              radius: 80,
              fill: '#fbbf24',
            },
          },
          {
            type: 'text',
            props: {
              text: 'LIKE & SAVE',
              left: W / 2,
              top: 650,
              fontSize: 64,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            props: {
              text: 'wenn dir das geholfen hat',
              left: W / 2,
              top: 740,
              fontSize: 32,
              fontFamily: 'Inter',
              fill: '#93c5fd',
              textAlign: 'center',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'business-professional',
    name: 'Business Pro',
    description: 'Professionelles Design für B2B Content',
    category: 'business',
    isPremium: true,
    thumbnailUrl: '/templates/business-pro.svg',
    colors: ['#0f172a', '#ffffff', '#0ea5e9'],
    slides: [
      {
        id: 'cover',
        backgroundColor: '#0f172a',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'rect',
              left: 0,
              top: H - 300,
              width: W,
              height: 300,
              fill: '#0ea5e9',
            },
          },
          {
            type: 'text',
            props: {
              text: 'BUSINESS',
              left: 80,
              top: 400,
              fontSize: 96,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'INSIGHTS',
              left: 80,
              top: 520,
              fontSize: 96,
              fontFamily: 'Inter',
              fill: '#0ea5e9',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: '2025 Edition',
              left: 80,
              top: H - 200,
              fontSize: 36,
              fontFamily: 'Inter',
              fill: '#0f172a',
              fontWeight: 'bold',
            },
          },
        ],
      },
      {
        id: 'content',
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'rect',
              left: 0,
              top: 0,
              width: W,
              height: 150,
              fill: '#0f172a',
            },
          },
          {
            type: 'text',
            props: {
              text: 'KEY INSIGHT',
              left: 80,
              top: 50,
              fontSize: 32,
              fontFamily: 'Inter',
              fill: '#0ea5e9',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Dein wichtigster Punkt',
              left: 80,
              top: 250,
              fontSize: 56,
              fontFamily: 'Inter',
              fill: '#0f172a',
              fontWeight: 'bold',
              width: W - 160,
            },
          },
          {
            type: 'text',
            props: {
              text: 'Füge hier eine ausführliche Erklärung hinzu, die deinen Lesern echten Mehrwert bietet.',
              left: 80,
              top: 380,
              fontSize: 32,
              fontFamily: 'Inter',
              fill: '#64748b',
              width: W - 160,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'gradient-modern',
    name: 'Gradient Modern',
    description: 'Moderne Farbverläufe für aufmerksamkeitsstarke Posts',
    category: 'marketing',
    isPremium: true,
    thumbnailUrl: '/templates/gradient-modern.svg',
    colors: ['#7c3aed', '#ec4899', '#ffffff'],
    slides: [
      {
        id: 'cover',
        backgroundColor: '#7c3aed',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'circle',
              left: W - 200,
              top: -200,
              radius: 400,
              fill: '#ec4899',
            },
          },
          {
            type: 'shape',
            props: {
              shape: 'circle',
              left: -200,
              top: H - 200,
              radius: 300,
              fill: '#a855f7',
            },
          },
          {
            type: 'text',
            props: {
              text: 'SOCIAL MEDIA',
              left: W / 2,
              top: 500,
              fontSize: 72,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            props: {
              text: 'STRATEGIE',
              left: W / 2,
              top: 600,
              fontSize: 72,
              fontFamily: 'Inter',
              fill: '#fbbf24',
              fontWeight: 'bold',
              textAlign: 'center',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'education-steps',
    name: 'Step by Step',
    description: 'Ideal für Tutorials und Anleitungen',
    category: 'education',
    isPremium: false,
    thumbnailUrl: '/templates/education-steps.svg',
    colors: ['#059669', '#ffffff', '#d1fae5'],
    slides: [
      {
        id: 'cover',
        backgroundColor: '#059669',
        elements: [
          {
            type: 'text',
            props: {
              text: 'SCHRITT FÜR',
              left: W / 2,
              top: 480,
              fontSize: 64,
              fontFamily: 'Inter',
              fill: '#d1fae5',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            props: {
              text: 'SCHRITT',
              left: W / 2,
              top: 560,
              fontSize: 96,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Anleitung zum Thema XY',
              left: W / 2,
              top: 700,
              fontSize: 36,
              fontFamily: 'Inter',
              fill: '#d1fae5',
              textAlign: 'center',
            },
          },
        ],
      },
      {
        id: 'step-1',
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'circle',
              left: 80,
              top: 100,
              radius: 60,
              fill: '#059669',
            },
          },
          {
            type: 'text',
            props: {
              text: '1',
              left: 140,
              top: 130,
              fontSize: 64,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Erster Schritt',
              left: 80,
              top: 280,
              fontSize: 56,
              fontFamily: 'Inter',
              fill: '#059669',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Erkläre hier was im ersten Schritt zu tun ist. Sei konkret und hilfreich.',
              left: 80,
              top: 380,
              fontSize: 32,
              fontFamily: 'Inter',
              fill: '#374151',
              width: W - 160,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'personal-brand',
    name: 'Personal Brand',
    description: 'Authentisches Design für Personal Branding',
    category: 'personal',
    isPremium: false,
    thumbnailUrl: '/templates/personal-brand.svg',
    colors: ['#f59e0b', '#1f2937', '#ffffff'],
    slides: [
      {
        id: 'cover',
        backgroundColor: '#1f2937',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'rect',
              left: 60,
              top: 60,
              width: W - 120,
              height: H - 120,
              fill: 'transparent',
              rx: 0,
              ry: 0,
            },
          },
          {
            type: 'text',
            props: {
              text: 'MEINE',
              left: 100,
              top: 400,
              fontSize: 48,
              fontFamily: 'Inter',
              fill: '#f59e0b',
            },
          },
          {
            type: 'text',
            props: {
              text: 'GESCHICHTE',
              left: 100,
              top: 470,
              fontSize: 80,
              fontFamily: 'Inter',
              fill: '#ffffff',
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Wie ich von A nach B kam',
              left: 100,
              top: 600,
              fontSize: 32,
              fontFamily: 'Inter',
              fill: '#9ca3af',
            },
          },
        ],
      },
      {
        id: 'story',
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'shape',
            props: {
              shape: 'rect',
              left: 0,
              top: 0,
              width: 100,
              height: H,
              fill: '#f59e0b',
            },
          },
          {
            type: 'text',
            props: {
              text: '"',
              left: 150,
              top: 200,
              fontSize: 200,
              fontFamily: 'Georgia',
              fill: '#e5e7eb',
            },
          },
          {
            type: 'text',
            props: {
              text: 'Dein inspirierendes Zitat oder die Kernaussage deiner Geschichte.',
              left: 180,
              top: 400,
              fontSize: 48,
              fontFamily: 'Inter',
              fill: '#1f2937',
              width: W - 280,
            },
          },
          {
            type: 'text',
            props: {
              text: '— Dein Name',
              left: 180,
              top: 700,
              fontSize: 28,
              fontFamily: 'Inter',
              fill: '#6b7280',
            },
          },
        ],
      },
    ],
  },
]

export function getTemplateById(id: string): CarouselTemplate | undefined {
  return DEFAULT_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): CarouselTemplate[] {
  if (category === 'all') return DEFAULT_TEMPLATES
  return DEFAULT_TEMPLATES.filter((t) => t.category === category)
}

export function getFreeTemplates(): CarouselTemplate[] {
  return DEFAULT_TEMPLATES.filter((t) => !t.isPremium)
}

export function getPremiumTemplates(): CarouselTemplate[] {
  return DEFAULT_TEMPLATES.filter((t) => t.isPremium)
}
