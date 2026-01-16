/**
 * Unsplash API Service
 * Provides stock images for carousel generation
 */

export interface UnsplashImage {
  id: string
  url: string // Regular size URL
  thumbUrl: string // Thumbnail URL
  width: number
  height: number
  description: string | null
  photographer: string
  photographerUrl: string
}

export interface UnsplashSearchResult {
  images: UnsplashImage[]
  total: number
}

const UNSPLASH_API_URL = 'https://api.unsplash.com'

/**
 * Search for images on Unsplash
 */
export async function searchImages(
  query: string,
  options: {
    perPage?: number
    page?: number
    orientation?: 'landscape' | 'portrait' | 'squarish'
  } = {}
): Promise<UnsplashSearchResult> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY not configured, returning empty results')
    return { images: [], total: 0 }
  }

  const { perPage = 5, page = 1, orientation = 'squarish' } = options

  const params = new URLSearchParams({
    query,
    per_page: String(perPage),
    page: String(page),
    orientation,
  })

  try {
    const response = await fetch(`${UNSPLASH_API_URL}/search/photos?${params}`, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    })

    if (!response.ok) {
      console.error('Unsplash API error:', response.status, await response.text())
      return { images: [], total: 0 }
    }

    const data = await response.json()

    const images: UnsplashImage[] = data.results.map((result: UnsplashAPIResult) => ({
      id: result.id,
      url: result.urls.regular,
      thumbUrl: result.urls.thumb,
      width: result.width,
      height: result.height,
      description: result.description || result.alt_description,
      photographer: result.user.name,
      photographerUrl: result.user.links.html,
    }))

    return {
      images,
      total: data.total,
    }
  } catch (error) {
    console.error('Unsplash search error:', error)
    return { images: [], total: 0 }
  }
}

/**
 * Get a random image for a topic
 */
export async function getRandomImage(
  query: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'squarish'
): Promise<UnsplashImage | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY not configured')
    return null
  }

  const params = new URLSearchParams({
    query,
    orientation,
  })

  try {
    const response = await fetch(`${UNSPLASH_API_URL}/photos/random?${params}`, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    })

    if (!response.ok) {
      console.error('Unsplash API error:', response.status)
      return null
    }

    const result: UnsplashAPIResult = await response.json()

    return {
      id: result.id,
      url: result.urls.regular,
      thumbUrl: result.urls.thumb,
      width: result.width,
      height: result.height,
      description: result.description || result.alt_description,
      photographer: result.user.name,
      photographerUrl: result.user.links.html,
    }
  } catch (error) {
    console.error('Unsplash random image error:', error)
    return null
  }
}

/**
 * Generate search keywords from slide content
 */
export function generateSearchKeywords(
  headline: string,
  body?: string,
  slideType?: string
): string {
  // Combine headline and body, extract key terms
  const text = `${headline} ${body || ''}`.toLowerCase()

  // Remove common stop words
  const stopWords = [
    'der',
    'die',
    'das',
    'und',
    'oder',
    'aber',
    'für',
    'mit',
    'von',
    'zu',
    'in',
    'an',
    'auf',
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'for',
    'with',
    'of',
    'to',
    'in',
    'on',
    'ist',
    'sind',
    'wie',
    'was',
    'ein',
    'eine',
    'dein',
    'deine',
    'ihr',
    'ihre',
  ]

  const words = text
    .replace(/[^\w\sÄÖÜäöüß]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word))

  // Take first 3 meaningful words
  const keywords = words.slice(0, 3).join(' ')

  // Add context based on slide type
  const contextMap: Record<string, string> = {
    hook: 'professional business',
    content: 'abstract concept',
    list: 'minimal icons',
    quote: 'inspirational',
    cta: 'action success',
  }

  const context = slideType ? contextMap[slideType] || '' : ''

  return `${keywords} ${context}`.trim()
}

// Unsplash API response types
interface UnsplashAPIResult {
  id: string
  width: number
  height: number
  description: string | null
  alt_description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    links: {
      html: string
    }
  }
}
