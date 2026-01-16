/**
 * Schema for AI-generated image search keywords
 * Used to find relevant stock images for slides
 */

import { z } from 'zod'

// Keywords for a single slide
export const SlideImageKeywordsSchema = z.object({
  slideIndex: z.number().describe('Index of the slide (0-based)'),
  useImage: z.boolean().describe('Whether this slide should have an image'),
  imageType: z.enum(['background', 'element', 'none']).describe('How the image should be used'),
  keywords: z.string().describe('Search keywords for Unsplash (2-4 words)'),
  style: z
    .enum(['photo', 'abstract', 'minimal', 'illustration'])
    .describe('Style of image to search for'),
})

export type SlideImageKeywords = z.infer<typeof SlideImageKeywordsSchema>

// Complete image plan for all slides
export const ImagePlanSchema = z.object({
  slides: z.array(SlideImageKeywordsSchema).describe('Image keywords for each slide'),
})

export type ImagePlan = z.infer<typeof ImagePlanSchema>

// JSON Schema for OpenAI Structured Output
export const imagePlanJsonSchema = {
  name: 'image_plan',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      slides: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            slideIndex: { type: 'number', description: 'Index of the slide (0-based)' },
            useImage: { type: 'boolean', description: 'Whether this slide should have an image' },
            imageType: {
              type: 'string',
              enum: ['background', 'element', 'none'],
              description: 'How the image should be used',
            },
            keywords: {
              type: 'string',
              description: 'Search keywords for Unsplash (2-4 words, in English)',
            },
            style: {
              type: 'string',
              enum: ['photo', 'abstract', 'minimal', 'illustration'],
              description: 'Style of image to search for',
            },
          },
          required: ['slideIndex', 'useImage', 'imageType', 'keywords', 'style'],
          additionalProperties: false,
        },
      },
    },
    required: ['slides'],
    additionalProperties: false,
  },
}
