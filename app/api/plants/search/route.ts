import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchPlants } from '@/lib/perenual/client'
import { getAIProvider } from '@/lib/ai'
import type { PlantSearchResult, PlantVerification } from '@/types/database'

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

    // Step 1: Try Perenual API first (database search)
    let results = await searchPlants(trimmedQuery)

    // If Perenual found results, return them with database verification status
    if (results.length > 0) {
      // Add verification info to Perenual results
      results = results.map(plant => ({
        ...plant,
        verification: {
          status: 'database',
          confidence: 'high',
        } as PlantVerification,
      }))

      return NextResponse.json({
        results,
        query: trimmedQuery,
        source: 'perenual',
      })
    }

    // Step 2: No Perenual results - use AI identification (not suggestions!)
    try {
      const aiProvider = getAIProvider()
      const identification = await aiProvider.identifyPlant(trimmedQuery)

      // If AI couldn't identify the plant, return empty results
      if (!identification.identified || identification.confidence === 'unknown') {
        console.log(`AI could not identify plant: "${trimmedQuery}" - ${identification.reason || 'unknown'}`)
        return NextResponse.json({
          results: [],
          query: trimmedQuery,
          source: null,
          message: 'Could not find a matching plant. Try adding it as a custom plant.',
        })
      }

      // AI identified the plant with some confidence
      const plant = identification.plant!

      // Step 3: For "likely" confidence, verify with web search
      let finalVerification: PlantVerification
      let finalSource: 'ai' | 'ai_verified' = 'ai'

      if (identification.confidence === 'likely') {
        // Attempt web search verification
        const webVerification = await aiProvider.verifyPlantWithWebSearch(
          trimmedQuery,
          JSON.stringify(plant)
        )

        if (webVerification.verified) {
          finalVerification = {
            status: 'web_verified',
            confidence: 'high',
            source_url: webVerification.source_url,
          }
          finalSource = 'ai_verified'

          // Apply any corrections from web search
          if (webVerification.corrections) {
            if (webVerification.corrections.top_level) {
              plant.top_level = webVerification.corrections.top_level
            }
            if (webVerification.corrections.middle_level) {
              plant.middle_level = webVerification.corrections.middle_level
            }
          }
          if (webVerification.scientific_name) {
            plant.scientific_name = webVerification.scientific_name
          }
        } else {
          // Web search couldn't verify - return empty results
          // We don't show unverified "likely" plants to avoid showing fake plants
          console.log(`Web verification failed for "${trimmedQuery}": ${webVerification.reason}`)
          return NextResponse.json({
            results: [],
            query: trimmedQuery,
            source: null,
            message: 'Could not verify this plant. Try adding it as a custom plant.',
          })
        }
      } else {
        // AI is confident (verified) - trust it
        finalVerification = {
          status: 'ai_identified',
          confidence: identification.confidence === 'verified' ? 'high' : 'medium',
        }
      }

      // Build the single result
      const result: PlantSearchResult = {
        id: -1, // Negative ID for AI results
        common_name: plant.common_name,
        scientific_name: plant.scientific_name,
        image_url: null, // AI results don't have images
        top_level: plant.top_level,
        middle_level: plant.middle_level,
        cultivar_name: plant.cultivar_name,
        cycle: plant.cycle,
        watering: plant.watering,
        sunlight: plant.sunlight,
        growth_habit: plant.growth_habit,
        source: finalSource,
        verification: finalVerification,
      }

      return NextResponse.json({
        results: [result],
        query: trimmedQuery,
        source: finalSource,
      })
    } catch (aiError) {
      console.error('AI identification error:', aiError)
      // Return empty results if AI fails
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
