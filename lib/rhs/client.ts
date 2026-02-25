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

    // Extract first image filename from the "images" array in embedded JSON
    const match = html.match(/"images"\s*:\s*\[\s*\{\s*"image"\s*:\s*"([^"]+)"/)
    if (!match?.[1]) {
      imageCache.set(rhsPageUrl, { imageUrl: null, timestamp: Date.now() })
      return null
    }

    const imageUrl = `${RHS_IMAGE_BASE}${match[1]}`
    imageCache.set(rhsPageUrl, { imageUrl, timestamp: Date.now() })
    return imageUrl
  } catch {
    return null
  }
}
