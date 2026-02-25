// lib/rhs/client.ts
// Fetches plant images from RHS detail pages

const RHS_IMAGE_BASE = 'https://apps.rhs.org.uk/plantselectorimages/detail/'

// Simple cache for RHS image URLs
const imageCache = new Map<string, { imageUrl: string | null; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetches an RHS plant detail page and extracts the first image URL.
 * Returns the full image URL or null if not found/error.
 */
export async function fetchRHSImage(rhsPageUrl: string): Promise<string | null> {
  const cached = imageCache.get(rhsPageUrl)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.imageUrl
  }

  try {
    const response = await fetch(rhsPageUrl, {
      headers: { 'Accept': 'text/html' },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return null

    const html = await response.text()

    // Try multiple extraction strategies

    // Strategy 1: JSON embedded images array
    const jsonMatch = html.match(/"images"\s*:\s*\[\s*\{\s*"image"\s*:\s*"([^"]+)"/)
    if (jsonMatch?.[1]) {
      const imageUrl = `${RHS_IMAGE_BASE}${jsonMatch[1]}`
      imageCache.set(rhsPageUrl, { imageUrl, timestamp: Date.now() })
      return imageUrl
    }

    // Strategy 2: og:image meta tag
    const ogMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i)
    if (ogMatch?.[1]) {
      imageCache.set(rhsPageUrl, { imageUrl: ogMatch[1], timestamp: Date.now() })
      return ogMatch[1]
    }

    // Strategy 3: RHS plant selector image in img tags
    const imgMatch = html.match(/plantselectorimages\/detail\/([^"'\s]+)/i)
    if (imgMatch?.[1]) {
      const imageUrl = `${RHS_IMAGE_BASE}${imgMatch[1]}`
      imageCache.set(rhsPageUrl, { imageUrl, timestamp: Date.now() })
      return imageUrl
    }

    imageCache.set(rhsPageUrl, { imageUrl: null, timestamp: Date.now() })
    return null
  } catch {
    return null
  }
}
