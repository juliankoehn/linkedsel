/**
 * AI Carousel Generation Pipeline
 * Orchestrates multi-step generation with validation and refinement
 */

import OpenAI from 'openai'

import type { BrandKit } from '@/types/brand-kit'
import { searchImages, type UnsplashImage } from '../../unsplash'
import { type CarouselData, carouselJsonSchema, type SlideData } from '../carousel-schema'
import { buildContentOutlinePrompt } from '../prompts/content-outline-prompt'
import { buildDesignSystemPrompt } from '../prompts/design-system-prompt'
import { buildImageKeywordsPrompt } from '../prompts/image-keywords-prompt'
import { buildLayoutPrompt } from '../prompts/layout-prompt'
import { buildRefinementPrompt, type ValidationError } from '../prompts/refinement-prompt'
import {
  type ContentOutline,
  contentOutlineJsonSchema,
  type SlideContent,
} from '../schemas/content-outline'
import { type DesignSystem, designSystemJsonSchema } from '../schemas/design-system'
import { type ImagePlan, imagePlanJsonSchema } from '../schemas/image-keywords'
import {
  getInvalidSlideIndices,
  getSlideErrors,
  type ValidationOptions,
  type ValidationResult,
  validateCarousel,
} from '../validation'

export type QualityTier = 'basic' | 'standard' | 'premium'

export interface PipelineConfig {
  topic: string
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
  slideCount: number
  language: 'de' | 'en'
  quality: QualityTier
  brandKit?: BrandKit | null
  canvasWidth: number
  canvasHeight: number
  useImages?: boolean
}

// Image data passed to layout generation
export interface SlideImageData {
  slideIndex: number
  imageType: 'background' | 'element' | 'none'
  image: UnsplashImage | null
}

export interface PipelineEvent {
  type:
    | 'start'
    | 'step_start'
    | 'step_complete'
    | 'slide_data'
    | 'slide_complete'
    | 'validation_error'
    | 'refinement_start'
    | 'progress'
    | 'error'
    | 'done'
  data: Record<string, unknown>
}

export type PipelineEventCallback = (event: PipelineEvent) => void

/**
 * Get credits required for a quality tier
 */
export function getCreditsForQuality(quality: QualityTier): number {
  switch (quality) {
    case 'basic':
      return 1
    case 'standard':
      return 2
    case 'premium':
      return 4
  }
}

/**
 * Get model for each step based on quality
 */
function getModelForStep(quality: QualityTier, step: string): string {
  if (quality === 'premium' && step === 'content') {
    return 'gpt-4o'
  }
  return 'gpt-4o-mini'
}

/**
 * Main generation pipeline class
 */
export class GenerationPipeline {
  private openai: OpenAI
  private config: PipelineConfig
  private onEvent: PipelineEventCallback
  private abortSignal?: AbortSignal

  constructor(
    apiKey: string,
    config: PipelineConfig,
    onEvent: PipelineEventCallback,
    abortSignal?: AbortSignal
  ) {
    this.openai = new OpenAI({ apiKey })
    this.config = config
    this.onEvent = onEvent
    this.abortSignal = abortSignal
  }

  private emit(event: PipelineEvent) {
    this.onEvent(event)
  }

  private checkAbort() {
    if (this.abortSignal?.aborted) {
      throw new Error('Generation cancelled')
    }
  }

  /**
   * Run the complete pipeline
   */
  async run(): Promise<CarouselData> {
    const { quality } = this.config

    const hasImages = this.config.useImages && quality !== 'basic'
    this.emit({
      type: 'start',
      data: {
        quality,
        totalSlides: this.config.slideCount,
        steps:
          quality === 'basic'
            ? 1
            : quality === 'standard'
              ? hasImages
                ? 5
                : 4
              : hasImages
                ? 6
                : 5,
        useImages: hasImages,
      },
    })

    try {
      // Basic quality: Use simple single-call approach
      if (quality === 'basic') {
        return await this.runBasicPipeline()
      }

      // Standard/Premium: Use multi-step pipeline
      return await this.runMultiStepPipeline()
    } catch (error) {
      this.emit({
        type: 'error',
        data: { message: error instanceof Error ? error.message : 'Pipeline failed' },
      })
      throw error
    }
  }

  /**
   * Basic pipeline - single OpenAI call (same as v1)
   */
  private async runBasicPipeline(): Promise<CarouselData> {
    this.checkAbort()

    this.emit({
      type: 'step_start',
      data: { step: 'generate', message: 'Generating carousel...' },
    })

    const systemPrompt = this.buildBasicSystemPrompt()
    const userPrompt = `Create a ${this.config.slideCount}-slide carousel about: "${this.config.topic}"`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: carouselJsonSchema,
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const carousel: CarouselData = JSON.parse(content)

    // Emit slides
    for (let i = 0; i < carousel.slides.length; i++) {
      this.emit({
        type: 'slide_data',
        data: { slideIndex: i, slide: carousel.slides[i] },
      })
      this.emit({
        type: 'slide_complete',
        data: { slideIndex: i + 1, totalSlides: carousel.slides.length },
      })
    }

    this.emit({
      type: 'done',
      data: { slidesCreated: carousel.slides.length, quality: 'basic' },
    })

    return carousel
  }

  /**
   * Multi-step pipeline for standard/premium quality
   */
  private async runMultiStepPipeline(): Promise<CarouselData> {
    const { quality, useImages } = this.config

    // Step 1: Generate content outline
    this.checkAbort()
    this.emit({
      type: 'step_start',
      data: { step: 'content', message: 'Creating content outline...' },
    })
    const contentOutline = await this.generateContentOutline()
    this.emit({
      type: 'step_complete',
      data: { step: 'content', outline: contentOutline },
    })

    // Step 2: Generate design system
    this.checkAbort()
    this.emit({
      type: 'step_start',
      data: { step: 'design', message: 'Creating design system...' },
    })
    const designSystem = await this.generateDesignSystem()
    this.emit({
      type: 'step_complete',
      data: { step: 'design', designSystem },
    })

    // Step 2.5: Generate image keywords and fetch images (if enabled)
    let slideImages: SlideImageData[] = []
    if (useImages) {
      this.checkAbort()
      this.emit({
        type: 'step_start',
        data: { step: 'images', message: 'Finding images...' },
      })
      slideImages = await this.generateAndFetchImages(contentOutline)
      this.emit({
        type: 'step_complete',
        data: {
          step: 'images',
          imagesFound: slideImages.filter((s) => s.image !== null).length,
        },
      })
    }

    // Step 3: Generate layouts for each slide
    this.checkAbort()
    this.emit({
      type: 'step_start',
      data: { step: 'layout', message: 'Generating slide layouts...' },
    })
    const slides = await this.generateLayouts(contentOutline, designSystem, slideImages)
    this.emit({
      type: 'step_complete',
      data: { step: 'layout', slideCount: slides.length },
    })

    let carousel: CarouselData = { slides }

    // Step 4: Validation
    this.checkAbort()
    this.emit({
      type: 'step_start',
      data: { step: 'validation', message: 'Validating layouts...' },
    })

    const validationOptions: ValidationOptions = {
      canvasWidth: this.config.canvasWidth,
      canvasHeight: this.config.canvasHeight,
      strictMode: quality === 'premium',
      minTextElements: 2,
    }

    const validationResult = validateCarousel(carousel, validationOptions)

    // Step 5: Refinement (premium only)
    if (!validationResult.isValid && quality === 'premium') {
      carousel = await this.refineCarousel(carousel, validationResult, validationOptions)
    } else if (!validationResult.isValid) {
      // Standard quality: Report errors but don't auto-fix
      this.emit({
        type: 'validation_error',
        data: {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          autoFix: false,
        },
      })
    }

    // Emit final slides
    for (let i = 0; i < carousel.slides.length; i++) {
      this.emit({
        type: 'slide_data',
        data: { slideIndex: i, slide: carousel.slides[i] },
      })
      this.emit({
        type: 'slide_complete',
        data: { slideIndex: i + 1, totalSlides: carousel.slides.length },
      })
    }

    this.emit({
      type: 'done',
      data: {
        slidesCreated: carousel.slides.length,
        quality,
        validationPassed: validationResult.isValid,
      },
    })

    return carousel
  }

  /**
   * Step 1: Generate content outline
   */
  private async generateContentOutline(): Promise<ContentOutline> {
    const { system, user } = buildContentOutlinePrompt({
      topic: this.config.topic,
      style: this.config.style,
      slideCount: this.config.slideCount,
      language: this.config.language,
    })

    const response = await this.openai.chat.completions.create({
      model: getModelForStep(this.config.quality, 'content'),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: contentOutlineJsonSchema,
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Failed to generate content outline')

    return JSON.parse(content)
  }

  /**
   * Step 2: Generate design system
   */
  private async generateDesignSystem(): Promise<DesignSystem> {
    const { system, user } = buildDesignSystemPrompt({
      style: this.config.style,
      brandKit: this.config.brandKit,
      canvasWidth: this.config.canvasWidth,
      canvasHeight: this.config.canvasHeight,
    })

    const response = await this.openai.chat.completions.create({
      model: getModelForStep(this.config.quality, 'design'),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: designSystemJsonSchema,
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Failed to generate design system')

    return JSON.parse(content)
  }

  /**
   * Step 2.5: Generate image keywords and fetch images from Unsplash
   */
  private async generateAndFetchImages(contentOutline: ContentOutline): Promise<SlideImageData[]> {
    // Generate image keywords using AI
    const { system, user } = buildImageKeywordsPrompt({
      contentOutline,
      style: this.config.style,
    })

    const response = await this.openai.chat.completions.create({
      model: getModelForStep(this.config.quality, 'images'),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: imagePlanJsonSchema,
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.warn('Failed to generate image keywords, continuing without images')
      return []
    }

    const imagePlan: ImagePlan = JSON.parse(content)
    const slideImages: SlideImageData[] = []

    // Fetch images from Unsplash for each slide that needs one
    for (const slideKeywords of imagePlan.slides) {
      if (!slideKeywords.useImage || slideKeywords.imageType === 'none') {
        slideImages.push({
          slideIndex: slideKeywords.slideIndex,
          imageType: 'none',
          image: null,
        })
        continue
      }

      this.emit({
        type: 'progress',
        data: {
          message: `Finding image for slide ${slideKeywords.slideIndex + 1}...`,
        },
      })

      try {
        // Search for images on Unsplash
        // Use 'squarish' for carousel format
        const result = await searchImages(slideKeywords.keywords, {
          perPage: 3,
          orientation: 'squarish',
        })

        const image = result.images[0] || null

        slideImages.push({
          slideIndex: slideKeywords.slideIndex,
          imageType: slideKeywords.imageType,
          image,
        })
      } catch (error) {
        console.error(`Failed to fetch image for slide ${slideKeywords.slideIndex}:`, error)
        slideImages.push({
          slideIndex: slideKeywords.slideIndex,
          imageType: 'none',
          image: null,
        })
      }
    }

    return slideImages
  }

  /**
   * Step 3: Generate layouts for all slides
   */
  private async generateLayouts(
    contentOutline: ContentOutline,
    designSystem: DesignSystem,
    slideImages: SlideImageData[] = []
  ): Promise<SlideData[]> {
    const slides: SlideData[] = []

    for (let i = 0; i < contentOutline.slides.length; i++) {
      this.checkAbort()

      this.emit({
        type: 'progress',
        data: {
          message: `Creating layout for slide ${i + 1}...`,
          slideIndex: i + 1,
          totalSlides: contentOutline.slides.length,
        },
      })

      const slideContent = contentOutline.slides[i]
      if (!slideContent) continue

      // Find image data for this slide
      const imageData = slideImages.find((s) => s.slideIndex === i) || null

      const slide = await this.generateSlideLayout(
        slideContent,
        i,
        contentOutline.slides.length,
        designSystem,
        imageData
      )
      slides.push(slide)
    }

    return slides
  }

  /**
   * Generate layout for a single slide
   */
  private async generateSlideLayout(
    slideContent: SlideContent,
    slideIndex: number,
    totalSlides: number,
    designSystem: DesignSystem,
    imageData?: SlideImageData | null
  ): Promise<SlideData> {
    const { system, user } = buildLayoutPrompt({
      slideContent,
      slideIndex,
      totalSlides,
      designSystem,
      canvasWidth: this.config.canvasWidth,
      canvasHeight: this.config.canvasHeight,
      imageData: imageData || undefined,
    })

    // For layout, we use the slide schema
    const slideJsonSchema = {
      name: 'slide_layout',
      strict: true,
      schema: carouselJsonSchema.schema.properties.slides.items,
    }

    const response = await this.openai.chat.completions.create({
      model: getModelForStep(this.config.quality, 'layout'),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: slideJsonSchema,
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error(`Failed to generate layout for slide ${slideIndex + 1}`)

    return JSON.parse(content)
  }

  /**
   * Step 5: Refine carousel with validation errors
   */
  private async refineCarousel(
    carousel: CarouselData,
    initialValidation: ValidationResult,
    options: ValidationOptions
  ): Promise<CarouselData> {
    const maxAttempts = 3
    const currentCarousel = carousel
    let validation = initialValidation

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.checkAbort()

      this.emit({
        type: 'refinement_start',
        data: {
          attempt,
          maxAttempts,
          errorCount: validation.errors.length,
        },
      })

      // Get invalid slide indices
      const invalidIndices = getInvalidSlideIndices(validation)

      // Refine each invalid slide
      for (const slideIndex of invalidIndices) {
        const slide = currentCarousel.slides[slideIndex]
        if (!slide) continue

        const errors = getSlideErrors(validation, slideIndex)
        const refinedSlide = await this.refineSlide(slide, slideIndex, errors, attempt, maxAttempts)
        currentCarousel.slides[slideIndex] = refinedSlide
      }

      // Re-validate
      validation = validateCarousel(currentCarousel, options)

      if (validation.isValid) {
        this.emit({
          type: 'step_complete',
          data: {
            step: 'refinement',
            attempts: attempt,
            success: true,
          },
        })
        return currentCarousel
      }
    }

    // Report remaining errors after max attempts
    this.emit({
      type: 'validation_error',
      data: {
        errors: validation.errors,
        warnings: validation.warnings,
        autoFix: true,
        maxAttemptsReached: true,
      },
    })

    return currentCarousel
  }

  /**
   * Refine a single slide
   */
  private async refineSlide(
    slide: SlideData,
    slideIndex: number,
    errors: ValidationError[],
    attempt: number,
    maxAttempts: number
  ): Promise<SlideData> {
    const { system, user } = buildRefinementPrompt({
      slide,
      slideIndex,
      errors,
      canvasWidth: this.config.canvasWidth,
      canvasHeight: this.config.canvasHeight,
      attempt,
      maxAttempts,
    })

    const slideJsonSchema = {
      name: 'refined_slide',
      strict: true,
      schema: carouselJsonSchema.schema.properties.slides.items,
    }

    const response = await this.openai.chat.completions.create({
      model: getModelForStep(this.config.quality, 'refinement'),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: slideJsonSchema,
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) return slide // Return original on failure

    return JSON.parse(content)
  }

  /**
   * Build basic system prompt (for v1 compatibility)
   */
  private buildBasicSystemPrompt(): string {
    const { canvasWidth, canvasHeight, brandKit, style, language } = this.config

    const styleInstructions = {
      professional:
        'Create a professional, business-focused design. Use clean layouts, ample whitespace, and a sophisticated color palette.',
      casual:
        'Create a friendly, approachable design. Use warm colors, relaxed layouts, and conversational tone.',
      educational:
        'Create a clear, informative design. Use structured layouts, numbered lists, and visual hierarchy.',
      inspirational:
        'Create an emotional, motivating design. Use bold typography, impactful statements, and dynamic compositions.',
    }

    const languageInstruction =
      language === 'de' ? 'Write all text content in German.' : 'Write all text content in English.'

    let brandContext = ''
    if (brandKit) {
      const colors = brandKit.colors.map((c) => `${c.name}: ${c.hex}`).join(', ')
      const fonts = brandKit.fonts.map((f) => `${f.name}: ${f.family} ${f.weight}`).join(', ')
      brandContext = `
BRAND KIT - Use these consistently:
- Colors: ${colors}
- Fonts: ${fonts}
`
    }

    return `You are a professional carousel designer for social media.

CANVAS SIZE: ${canvasWidth}x${canvasHeight} pixels

${styleInstructions[style]}
${languageInstruction}
${brandContext}

DESIGN GUIDELINES:
- Create clear visual hierarchy with headline, body text, and optional decorative elements
- Use generous padding (minimum 60px from edges)
- Headlines should be large (48-72px) and bold
- Body text should be readable (24-36px)
- Use shapes sparingly for visual interest
- Each slide should be complete and visually balanced
- The first slide should be a hook that grabs attention
- The last slide should have a call-to-action

CRITICAL REQUIREMENTS:
- Every slide MUST have at least 2 text elements: a headline and body text
- Use contrasting colors for text on background
- Position elements with proper spacing - don't overlap text elements`
  }
}
