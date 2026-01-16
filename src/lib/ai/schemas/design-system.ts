/**
 * Schema for AI-generated design system
 * Step 2 of the generation pipeline
 */

import { z } from 'zod'

// Hex color validation
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')

// Color palette
export const ColorPaletteSchema = z.object({
  primary: hexColorSchema.describe('Primary brand color'),
  secondary: hexColorSchema.describe('Secondary accent color'),
  background: hexColorSchema.describe('Default slide background'),
  backgroundAlt: hexColorSchema.describe('Alternative background for variety'),
  text: hexColorSchema.describe('Primary text color'),
  textMuted: hexColorSchema.describe('Muted/secondary text color'),
  accent: hexColorSchema.describe('Accent color for highlights'),
})

export type ColorPalette = z.infer<typeof ColorPaletteSchema>

// Typography settings
export const TypographySettingsSchema = z.object({
  size: z.number().min(12).max(120).describe('Font size in pixels'),
  weight: z.enum(['normal', 'medium', 'semibold', 'bold']).describe('Font weight'),
  lineHeight: z.number().min(1).max(2).optional().describe('Line height multiplier'),
})

export type TypographySettings = z.infer<typeof TypographySettingsSchema>

export const TypographySystemSchema = z.object({
  headline: TypographySettingsSchema.describe('Settings for main headlines'),
  subheadline: TypographySettingsSchema.describe('Settings for subheadlines'),
  body: TypographySettingsSchema.describe('Settings for body text'),
  caption: TypographySettingsSchema.describe('Settings for captions/small text'),
})

export type TypographySystem = z.infer<typeof TypographySystemSchema>

// Spacing settings
export const SpacingSystemSchema = z.object({
  paddingHorizontal: z.number().min(20).max(120).describe('Horizontal padding from edges'),
  paddingVertical: z.number().min(20).max(120).describe('Vertical padding from edges'),
  elementGap: z.number().min(8).max(60).describe('Gap between elements'),
  sectionGap: z.number().min(16).max(80).describe('Gap between sections'),
})

export type SpacingSystem = z.infer<typeof SpacingSystemSchema>

// Decorative elements style
export const DecorativeStyleSchema = z.object({
  useShapes: z.boolean().describe('Whether to add decorative shapes'),
  shapeStyle: z.enum(['geometric', 'organic', 'minimal', 'bold']).describe('Style of shapes'),
  cornerRadius: z.number().min(0).max(50).describe('Default corner radius for shapes'),
  opacity: z.number().min(0.1).max(1).describe('Opacity for decorative elements'),
})

export type DecorativeStyle = z.infer<typeof DecorativeStyleSchema>

// Complete design system
export const DesignSystemSchema = z.object({
  colors: ColorPaletteSchema,
  typography: TypographySystemSchema,
  spacing: SpacingSystemSchema,
  decorative: DecorativeStyleSchema,
})

export type DesignSystem = z.infer<typeof DesignSystemSchema>

// JSON Schema for OpenAI Structured Output
export const designSystemJsonSchema = {
  name: 'design_system',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      colors: {
        type: 'object',
        properties: {
          primary: { type: 'string', description: 'Primary brand color (hex)' },
          secondary: { type: 'string', description: 'Secondary accent color (hex)' },
          background: { type: 'string', description: 'Default slide background (hex)' },
          backgroundAlt: { type: 'string', description: 'Alternative background (hex)' },
          text: { type: 'string', description: 'Primary text color (hex)' },
          textMuted: { type: 'string', description: 'Muted text color (hex)' },
          accent: { type: 'string', description: 'Accent color for highlights (hex)' },
        },
        required: [
          'primary',
          'secondary',
          'background',
          'backgroundAlt',
          'text',
          'textMuted',
          'accent',
        ],
        additionalProperties: false,
      },
      typography: {
        type: 'object',
        properties: {
          headline: {
            type: 'object',
            properties: {
              size: { type: 'number', description: 'Font size in pixels' },
              weight: { type: 'string', enum: ['normal', 'medium', 'semibold', 'bold'] },
              lineHeight: { type: 'number', description: 'Line height multiplier' },
            },
            required: ['size', 'weight'],
            additionalProperties: false,
          },
          subheadline: {
            type: 'object',
            properties: {
              size: { type: 'number' },
              weight: { type: 'string', enum: ['normal', 'medium', 'semibold', 'bold'] },
              lineHeight: { type: 'number' },
            },
            required: ['size', 'weight'],
            additionalProperties: false,
          },
          body: {
            type: 'object',
            properties: {
              size: { type: 'number' },
              weight: { type: 'string', enum: ['normal', 'medium', 'semibold', 'bold'] },
              lineHeight: { type: 'number' },
            },
            required: ['size', 'weight'],
            additionalProperties: false,
          },
          caption: {
            type: 'object',
            properties: {
              size: { type: 'number' },
              weight: { type: 'string', enum: ['normal', 'medium', 'semibold', 'bold'] },
              lineHeight: { type: 'number' },
            },
            required: ['size', 'weight'],
            additionalProperties: false,
          },
        },
        required: ['headline', 'subheadline', 'body', 'caption'],
        additionalProperties: false,
      },
      spacing: {
        type: 'object',
        properties: {
          paddingHorizontal: { type: 'number', description: 'Horizontal padding' },
          paddingVertical: { type: 'number', description: 'Vertical padding' },
          elementGap: { type: 'number', description: 'Gap between elements' },
          sectionGap: { type: 'number', description: 'Gap between sections' },
        },
        required: ['paddingHorizontal', 'paddingVertical', 'elementGap', 'sectionGap'],
        additionalProperties: false,
      },
      decorative: {
        type: 'object',
        properties: {
          useShapes: { type: 'boolean' },
          shapeStyle: { type: 'string', enum: ['geometric', 'organic', 'minimal', 'bold'] },
          cornerRadius: { type: 'number' },
          opacity: { type: 'number' },
        },
        required: ['useShapes', 'shapeStyle', 'cornerRadius', 'opacity'],
        additionalProperties: false,
      },
    },
    required: ['colors', 'typography', 'spacing', 'decorative'],
    additionalProperties: false,
  },
}
