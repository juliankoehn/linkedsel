/**
 * Prompt for generating image search keywords for Unsplash
 */

import type { ContentOutline } from '../schemas/content-outline'

export interface ImageKeywordsPromptContext {
  contentOutline: ContentOutline
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
}

export function buildImageKeywordsPrompt(context: ImageKeywordsPromptContext): {
  system: string
  user: string
} {
  const { contentOutline, style } = context

  const styleGuidance: Record<string, string> = {
    professional:
      'Use professional, business-appropriate imagery. Think office, teamwork, technology, success.',
    casual: 'Use friendly, relatable imagery. Think lifestyle, people, nature, everyday moments.',
    educational: 'Use clear, illustrative imagery. Think diagrams, concepts, learning, books.',
    inspirational:
      'Use emotional, powerful imagery. Think landscapes, achievement, nature, adventure.',
  }

  const system = `You are an image curator for social media carousels.
Your task is to determine which slides need images and generate search keywords for Unsplash.

GUIDELINES:
1. NOT every slide needs an image - be selective
2. Hook slides (first slide) often benefit from a striking background image
3. List slides usually work better WITHOUT images (text-focused)
4. Quote slides can use subtle background images
5. CTA slides can have images but keep them simple
6. Content slides depend on the content - use judgement

IMAGE TYPES:
- "background": Full-slide background with text overlay (needs high contrast)
- "element": Smaller image placed within the slide layout
- "none": No image for this slide

STYLE GUIDANCE FOR "${style.toUpperCase()}":
${styleGuidance[style]}

KEYWORD RULES:
- Keywords MUST be in English (Unsplash works best with English)
- Use 2-4 descriptive words
- Be specific but not too niche
- Avoid abstract concepts that don't photograph well
- Good: "business meeting teamwork", "laptop coffee workspace"
- Bad: "success", "motivation", "the concept of time"

IMPORTANT:
- Maximum 50% of slides should have images (keep it clean)
- If in doubt, choose "none" - less is more
- Background images need to work with text overlays`

  const contentJson = JSON.stringify(contentOutline, null, 2)

  const user = `Analyze this carousel content and generate image search keywords for each slide.

CONTENT:
${contentJson}

For each slide, decide:
1. Should it have an image? (useImage)
2. How should the image be used? (imageType: background/element/none)
3. What keywords to search for? (keywords - in English!)
4. What style of image? (photo/abstract/minimal/illustration)`

  return { system, user }
}
