/**
 * Schema for AI-generated content outline
 * Step 1 of the generation pipeline
 */

import { z } from 'zod'

// Slide types for different purposes
export const SlideTypeSchema = z.enum(['hook', 'content', 'list', 'quote', 'cta'])

export type SlideType = z.infer<typeof SlideTypeSchema>

// Individual slide content
export const SlideContentSchema = z.object({
  type: SlideTypeSchema,
  headline: z.string().describe('Main headline for the slide'),
  subheadline: z.string().optional().describe('Optional subheadline'),
  body: z.string().optional().describe('Body text for content slides'),
  bullets: z.array(z.string()).optional().describe('Bullet points for list slides'),
  quote: z.string().optional().describe('Quote text for quote slides'),
  attribution: z.string().optional().describe('Quote attribution'),
  cta: z.string().optional().describe('Call-to-action text'),
})

export type SlideContent = z.infer<typeof SlideContentSchema>

// Complete content outline
export const ContentOutlineSchema = z.object({
  title: z.string().describe('Overall carousel title/theme'),
  slides: z.array(SlideContentSchema).min(1).max(10).describe('Content for each slide'),
})

export type ContentOutline = z.infer<typeof ContentOutlineSchema>

// JSON Schema for OpenAI Structured Output
export const contentOutlineJsonSchema = {
  name: 'content_outline',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Overall carousel title/theme',
      },
      slides: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['hook', 'content', 'list', 'quote', 'cta'],
              description: 'Type of slide',
            },
            headline: {
              type: 'string',
              description: 'Main headline for the slide',
            },
            subheadline: {
              type: 'string',
              description: 'Optional subheadline',
            },
            body: {
              type: 'string',
              description: 'Body text for content slides',
            },
            bullets: {
              type: 'array',
              items: { type: 'string' },
              description: 'Bullet points for list slides',
            },
            quote: {
              type: 'string',
              description: 'Quote text for quote slides',
            },
            attribution: {
              type: 'string',
              description: 'Quote attribution',
            },
            cta: {
              type: 'string',
              description: 'Call-to-action text',
            },
          },
          required: ['type', 'headline'],
          additionalProperties: false,
        },
        minItems: 1,
        maxItems: 10,
      },
    },
    required: ['title', 'slides'],
    additionalProperties: false,
  },
}
