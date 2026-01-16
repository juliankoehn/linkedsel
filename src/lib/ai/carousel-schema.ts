/**
 * Schema for AI-generated carousel content using Structured Output
 */

import { z } from 'zod'

// Text element schema
export const TextElementSchema = z.object({
  type: z.literal('text'),
  text: z.string().describe('The text content'),
  x: z.number().describe('X position from left edge'),
  y: z.number().describe('Y position from top edge'),
  width: z.number().describe('Width of the text box'),
  fontSize: z.number().describe('Font size in pixels'),
  fontWeight: z.enum(['normal', 'bold', '500', '600', '700']).default('normal'),
  color: z.string().describe('Text color in hex format'),
  textAlign: z.enum(['left', 'center', 'right']).default('left'),
})

// Rectangle element schema
export const RectElementSchema = z.object({
  type: z.literal('rectangle'),
  x: z.number().describe('X position'),
  y: z.number().describe('Y position'),
  width: z.number().describe('Width'),
  height: z.number().describe('Height'),
  fill: z.string().describe('Fill color in hex'),
  cornerRadius: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
})

// Circle element schema
export const CircleElementSchema = z.object({
  type: z.literal('circle'),
  x: z.number().describe('X position of center'),
  y: z.number().describe('Y position of center'),
  radius: z.number().describe('Radius'),
  fill: z.string().describe('Fill color in hex'),
  opacity: z.number().min(0).max(1).default(1),
})

// Union of all element types
export const ElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  RectElementSchema,
  CircleElementSchema,
])

// Single slide schema
export const SlideSchema = z.object({
  backgroundColor: z.string().describe('Background color in hex format'),
  elements: z.array(ElementSchema).describe('Elements on the slide'),
})

// Complete carousel schema
export const CarouselSchema = z.object({
  slides: z.array(SlideSchema).describe('Array of slides in the carousel'),
})

// Types derived from schemas
export type TextElementData = z.infer<typeof TextElementSchema>
export type RectElementData = z.infer<typeof RectElementSchema>
export type CircleElementData = z.infer<typeof CircleElementSchema>
export type ElementData = z.infer<typeof ElementSchema>
export type SlideData = z.infer<typeof SlideSchema>
export type CarouselData = z.infer<typeof CarouselSchema>

// JSON Schema for OpenAI (converted from Zod)
// Note: strict mode requires ALL properties in required array, optional fields use type: ['string', 'null'] etc.
export const carouselJsonSchema = {
  name: 'carousel',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      slides: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            backgroundColor: {
              type: 'string',
              description: 'Background color in hex format (e.g., #ffffff)',
            },
            elements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['text', 'rectangle', 'circle'],
                  },
                  // Text properties (null when not text type)
                  text: { type: ['string', 'null'] },
                  x: { type: 'number' },
                  y: { type: 'number' },
                  width: { type: ['number', 'null'] },
                  fontSize: { type: ['number', 'null'] },
                  fontWeight: {
                    type: ['string', 'null'],
                    enum: ['normal', 'bold', '500', '600', '700', null],
                  },
                  color: { type: ['string', 'null'] },
                  textAlign: { type: ['string', 'null'], enum: ['left', 'center', 'right', null] },
                  // Shape properties (null when not shape type)
                  height: { type: ['number', 'null'] },
                  fill: { type: ['string', 'null'] },
                  cornerRadius: { type: ['number', 'null'] },
                  radius: { type: ['number', 'null'] },
                  opacity: { type: ['number', 'null'] },
                },
                required: [
                  'type',
                  'x',
                  'y',
                  'text',
                  'width',
                  'fontSize',
                  'fontWeight',
                  'color',
                  'textAlign',
                  'height',
                  'fill',
                  'cornerRadius',
                  'radius',
                  'opacity',
                ],
                additionalProperties: false,
              },
            },
          },
          required: ['backgroundColor', 'elements'],
          additionalProperties: false,
        },
      },
    },
    required: ['slides'],
    additionalProperties: false,
  },
}
