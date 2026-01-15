export interface SlideTemplate {
  id: string
  backgroundColor: string
  elements: TemplateElement[]
}

export interface TemplateElement {
  type: 'text' | 'shape' | 'image'
  props: TextElementProps | ShapeElementProps | ImageElementProps
}

export interface TextElementProps {
  text: string
  left: number
  top: number
  fontSize: number
  fontFamily: string
  fill: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  width?: number
}

export interface ShapeElementProps {
  shape: 'rect' | 'circle'
  left: number
  top: number
  width?: number
  height?: number
  radius?: number
  fill: string
  rx?: number
  ry?: number
}

export interface ImageElementProps {
  src: string
  left: number
  top: number
  width: number
  height: number
}

export interface CarouselTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  isPremium: boolean
  thumbnailUrl: string
  slides: SlideTemplate[]
  colors: string[]
}

export type TemplateCategory =
  | 'business'
  | 'marketing'
  | 'education'
  | 'personal'
  | 'minimal'
  | 'bold'

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, string> = {
  business: 'Business',
  marketing: 'Marketing',
  education: 'Education',
  personal: 'Personal Brand',
  minimal: 'Minimal',
  bold: 'Bold',
}
