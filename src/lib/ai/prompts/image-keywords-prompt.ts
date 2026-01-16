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

GUIDELINES FOR EACH SLIDE TYPE:
1. Hook slides (first slide): Use "background" for dramatic effect OR "element" for a more modern look
2. Content slides: Prefer "element" - image next to text creates visual balance
3. List slides: Can use "element" (small icon-style) or "none" for text focus
4. Quote slides: Use "background" with overlay for emotional impact
5. CTA slides: Use "element" for a professional look or "none" to keep focus on action

IMAGE TYPES:
- "background": Full-slide background with text overlay. Use for emotional/dramatic slides. Text will have dark overlay for readability.
- "element": Image placed within the layout (right/left/top of text). Use for informative slides. Creates visual variety.
- "none": No image for this slide. Use sparingly - images make carousels more engaging.

PREFER "element" OVER "background" for:
- Content slides with informative text
- List slides where you can add a visual accent
- Any slide where the text should be the focus but needs visual support

USE "background" FOR:
- Emotional or atmospheric slides
- Hook slides to grab attention
- Quote slides for impact

STYLE GUIDANCE FOR "${style.toUpperCase()}":
${styleGuidance[style]}

KEYWORD RULES:
- Keywords MUST be in English (Unsplash works best with English)
- Use 2-4 descriptive words
- Be specific but not too niche
- For "element" images: search for clear, object-focused images
- For "background" images: search for atmospheric, wide images
- Good: "business meeting teamwork", "laptop coffee workspace", "person working laptop"
- Bad: "success", "motivation", "the concept of time"

IMPORTANT:
- Aim for 50-70% of slides having images (modern carousels are visual!)
- Mix "background" and "element" types for variety
- Element images work great for content/list slides`

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
