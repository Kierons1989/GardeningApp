import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchPlants } from '@/lib/perenual/client'
import { getAIProvider } from '@/lib/ai'
import type { PlantSearchResult } from '@/types/database'

// AI fallback prompt for plant search suggestions
const plantSearchPrompt = (query: string) => `You are a UK gardening expert. A user is searching for plants with the query: "${query}"

Suggest up to 5 plants that match this search query. Focus on plants commonly grown in UK gardens.

Return a JSON array of plant objects with this structure:
[
  {
    "common_name": "Full common name (e.g., Climbing Rose)",
    "scientific_name": "Latin name or null",
    "top_level": "Plant family/group (e.g., Rose, Hydrangea)",
    "middle_level": "Specific type (e.g., Climbing Rose, Mophead Hydrangea)",
    "cycle": "Perennial|Annual|Biennial",
    "watering": "Average|Frequent|Minimum",
    "sunlight": ["Full sun", "Part shade"],
    "growth_habit": ["Climber", "Shrub", "Perennial", etc.]
  }
]

Guidelines:
- Match the search query as closely as possible
- Prioritize common UK garden plants
- Include different types/varieties if the query is general (e.g., "rose" should return Climbing Rose, Shrub Rose, etc.)
- Return an empty array [] if the query doesn't match any known plants
- Return ONLY valid JSON, no other text`

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const trimmedQuery = query.trim()

    // Try Perenual API first
    let results = await searchPlants(trimmedQuery)

    // If Perenual returned no results, fall back to AI
    if (results.length === 0) {
      try {
        const aiProvider = getAIProvider()
        const prompt = plantSearchPrompt(trimmedQuery)
        const aiResponse = await aiProvider.generateText(prompt)

        const aiResults = JSON.parse(aiResponse)

        if (Array.isArray(aiResults)) {
          results = aiResults.map((plant, index): PlantSearchResult => ({
            id: -(index + 1), // Negative IDs for AI results
            common_name: plant.common_name || trimmedQuery,
            scientific_name: plant.scientific_name || null,
            image_url: null, // AI results don't have images
            top_level: plant.top_level || 'Plant',
            middle_level: plant.middle_level || plant.common_name || trimmedQuery,
            cycle: plant.cycle || 'Perennial',
            watering: plant.watering || 'Average',
            sunlight: plant.sunlight || ['Full sun'],
            growth_habit: plant.growth_habit || [],
            source: 'ai',
          }))
        }
      } catch (aiError) {
        console.error('AI fallback error:', aiError)
        // Return empty results if both Perenual and AI fail
      }
    }

    return NextResponse.json({
      results,
      query: trimmedQuery,
      source: results.length > 0 ? results[0].source : null,
    })
  } catch (error) {
    console.error('Plant search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
