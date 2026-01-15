export interface BrandKit {
  id: string
  name: string
  colors: BrandColor[]
  fonts: BrandFont[]
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface BrandColor {
  id: string
  name: string
  hex: string
}

export interface BrandFont {
  id: string
  name: string
  family: string
  weight: string
}

export const DEFAULT_COLORS: BrandColor[] = [
  { id: '1', name: 'Primary', hex: '#3b82f6' },
  { id: '2', name: 'Secondary', hex: '#6366f1' },
  { id: '3', name: 'Accent', hex: '#f59e0b' },
  { id: '4', name: 'Text', hex: '#1f2937' },
  { id: '5', name: 'Background', hex: '#ffffff' },
]

export const DEFAULT_FONTS: BrandFont[] = [
  { id: '1', name: 'Heading', family: 'Inter', weight: 'bold' },
  { id: '2', name: 'Body', family: 'Inter', weight: 'normal' },
]
