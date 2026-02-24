import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import type { PlantSearchResult } from '@/types/database'

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

    try {
      const aiProvider = getAIProvider()
      const searchResult = await aiProvider.searchPlant(trimmedQuery)

      // Plant identified successfully
      if (searchResult.identified && searchResult.plant) {
        const plant = searchResult.plant
        const result: PlantSearchResult = {
          id: -1,
          common_name: plant.common_name,
          scientific_name: plant.scientific_name,
          image_url: plant.image_url || null,
          top_level: plant.top_level,
          middle_level: plant.middle_level,
          cultivar_name: plant.cultivar_name,
          cycle: plant.cycle,
          watering: plant.watering,
          sunlight: plant.sunlight,
          growth_habit: plant.growth_habit,
          source: 'ai_verified',
          verification: {
            status: searchResult.source_url ? 'web_verified' : 'ai_identified',
            confidence: 'high',
            source_url: searchResult.source_url,
          },
        }

        return NextResponse.json({
          results: [result],
          query: trimmedQuery,
          source: 'ai',
        })
      }

      // Not identified but spelling suggestion available
      if (searchResult.spelling_suggestion) {
        return NextResponse.json({
          results: [],
          query: trimmedQuery,
          source: null,
          message: 'Could not find a matching plant.',
          suggestion: {
            original: trimmedQuery,
            corrected: searchResult.spelling_suggestion,
          },
        })
      }

      // Nothing found
      return NextResponse.json({
        results: [],
        query: trimmedQuery,
        source: null,
        message: 'Could not find a matching plant. Try adding it as a custom plant.',
      })
    } catch (aiError) {
      console.error('AI search error:', aiError)
      return NextResponse.json({
        results: [],
        query: trimmedQuery,
        source: null,
        message: 'Search temporarily unavailable. Try adding your plant as a custom entry.',
      })
    }
  } catch (error) {
    console.error('Plant search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
