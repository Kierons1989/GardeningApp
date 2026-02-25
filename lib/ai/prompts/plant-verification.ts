// lib/ai/prompts/plant-verification.ts
// Unified plant search prompt - uses web search to find all matching plants

export interface PlantData {
  common_name: string;
  scientific_name: string;
  top_level: string;
  middle_level: string;
  cultivar_name: string | null;
  cycle: string;
  watering: string;
  sunlight: string[];
  growth_habit: string[];
  image_url: string | null;
  uk_hardiness: string | null;
  source_url?: string;
}

export interface PlantVerificationResponse {
  identified: boolean;
  confidence: 'verified' | 'unknown';
  plants?: PlantData[];
  spelling_suggestion?: string;
  reason?: string;
}

export const unifiedPlantSearchPrompt = (query: string) => `You are a botanical identification expert with access to web search. Your task is to find ALL plants that match the user's search query.

Search query: "${query}"

IDENTIFICATION STRATEGY:
1. For common/generic genus names (e.g., "rose", "lavender", "tomato") — identify from your training data directly. Return a single representative entry. No web search needed.
2. For cultivar names, variety names, or anything that could match multiple plants — ALWAYS USE WEB SEARCH. Search RHS (rhs.org.uk) first. Return ALL matching variants you find, up to 6 results.
3. For specific cultivars with genus included (e.g., "Gardeners Delight tomato") — web search to confirm and return the specific match.
4. If the query looks misspelled and you find nothing, search for similar plant names and include a spelling suggestion.

WHEN TO RETURN MULTIPLE RESULTS:
- A cultivar name that applies to multiple plant forms (e.g., "Iceberg" → bush rose, climbing rose, baby/patio rose)
- A name shared across different species (e.g., a name used for both a rose and a clematis)
- Search RHS for the query and return every distinct plant entry you find

SEARCH STRATEGY FOR MULTIPLE RESULTS:
- Search rhs.org.uk for the query name to find a listing of all variants
- For each variant found, extract the key details (common name, scientific name, type)
- Prioritise returning all variants over fetching images for each one — it's fine to leave image_url as null
- Use remaining web searches to fetch images for the top 1-2 results if possible

CRITICAL ANTI-HALLUCINATION RULES:
1. ONLY return identified: true if you have CONFIRMED the plant exists — either from certain training data knowledge OR from an authoritative web source.
2. Every plant in the "plants" array must be individually verified. Do NOT infer variants — only include plants you have explicitly found on an authoritative source.
3. NEVER invent or combine plant names. "Wiseman Dahlia" is NOT a real plant just because "Wiseman" and "Dahlia" are words.
4. NEVER guess cultivar names. If you search and cannot find the exact cultivar, return unknown.
5. If the query is gibberish or not a plant name, return unknown.
6. If web search finds conflicting information, prefer RHS over other sources.

IMAGE EXTRACTION:
When you visit an RHS plant page or other authoritative source during web search, look for the plant's primary photo URL and include it in the image_url field. Prefer images from:
- RHS plant detail pages (apps.rhs.org.uk/plantselectorimages/detail/...)
- Wikipedia commons images
- UK nursery product images (crocus.co.uk, thompson-morgan.com, davidaustinroses.co.uk)

Return a JSON object with this structure:

IF PLANT(S) IDENTIFIED:
{
  "identified": true,
  "confidence": "verified",
  "plants": [
    {
      "common_name": "Full display name (e.g., Iceberg Rose)",
      "scientific_name": "Botanical name (e.g., Rosa 'Iceberg')",
      "top_level": "Plant genus/family (e.g., Rose)",
      "middle_level": "Specific type within the genus (see MIDDLE_LEVEL RULES below)",
      "cultivar_name": "The cultivar name if applicable (e.g., Iceberg), or null",
      "cycle": "Perennial | Annual | Biennial",
      "watering": "Average | Frequent | Minimum",
      "sunlight": ["Full sun", "Part shade", "Full shade"],
      "growth_habit": ["Shrub", "Climber", "Evergreen", etc.],
      "image_url": "Direct URL to a photo of this plant, or null if not found",
      "uk_hardiness": "UK hardiness rating if found, or null",
      "source_url": "URL of the authoritative source page for THIS specific plant"
    }
  ],
  "reason": "Brief explanation of how the plants were identified"
}

IF PLANT NOT FOUND BUT SPELLING SUGGESTION AVAILABLE:
{
  "identified": false,
  "confidence": "unknown",
  "spelling_suggestion": "Correctly spelled plant name",
  "reason": "Could not find '[query]' but found similar plant '[suggestion]' on [source]"
}

IF PLANT NOT FOUND:
{
  "identified": false,
  "confidence": "unknown",
  "reason": "Detailed explanation of what was searched and why plant could not be identified"
}

MIDDLE_LEVEL RULES - FOLLOW EXACTLY:
- For specific cultivars/types: Use the specific type (e.g., "Cherry Tomato", "Yakushimanum Hybrid", "English Rose", "Mophead Hydrangea", "Floribunda Rose", "Climbing Rose")
- For generic genus searches (e.g., "Jasmine", "Lavender", "Fuchsia"): Set middle_level to match top_level (e.g., top_level: "Jasmine", middle_level: "Jasmine")
- NEVER use generic growth habits as middle_level. These are WRONG: "Flowering Shrub", "Herbaceous Perennial", "Evergreen Tree", "Deciduous Shrub"
- The middle_level must always be plant-specific, never a generic botanical category

EXAMPLES:

Query: "Iceberg"
→ Web search rhs.org.uk for "Iceberg" — finds multiple rose variants
→ {"identified": true, "confidence": "verified", "plants": [{"common_name": "Iceberg Rose", "scientific_name": "Rosa Iceberg ('Korbin')", "top_level": "Rose", "middle_level": "Floribunda Rose", "cultivar_name": "Iceberg", "cycle": "Perennial", "watering": "Average", "sunlight": ["Full sun", "Part shade"], "growth_habit": ["Shrub"], "image_url": null, "uk_hardiness": "Hardy (H6)", "source_url": "https://www.rhs.org.uk/plants/details?plantid=2382"}, {"common_name": "Climbing Iceberg Rose", "scientific_name": "Rosa 'Climbing Iceberg'", "top_level": "Rose", "middle_level": "Climbing Rose", "cultivar_name": "Climbing Iceberg", "cycle": "Perennial", "watering": "Average", "sunlight": ["Full sun", "Part shade"], "growth_habit": ["Climber"], "image_url": null, "uk_hardiness": "Hardy (H6)", "source_url": "https://www.rhs.org.uk/plants/details?plantid=5765"}], "reason": "Found multiple Iceberg rose variants on RHS"}

Query: "Gardeners Delight tomato"
→ Web search rhs.org.uk for "Gardeners Delight tomato"
→ Found on RHS: Solanum lycopersicum 'Gardeners Delight', cherry tomato cultivar
→ {"identified": true, "confidence": "verified", "plants": [{"common_name": "Gardeners Delight Tomato", "scientific_name": "Solanum lycopersicum 'Gardeners Delight'", "top_level": "Tomato", "middle_level": "Cherry Tomato", "cultivar_name": "Gardeners Delight", "cycle": "Annual", "watering": "Frequent", "sunlight": ["Full sun"], "growth_habit": ["Vine", "Indeterminate"], "image_url": "https://apps.rhs.org.uk/plantselectorimages/detail/WSY0034498_4106.jpg", "uk_hardiness": "Half-hardy (H2)", "source_url": "https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own"}], "reason": "Found on RHS as a cherry tomato cultivar"}

Query: "Percy Wiseman"
→ Known from training data: Rhododendron yakushimanum 'Percy Wiseman'
→ {"identified": true, "confidence": "verified", "plants": [{"common_name": "Percy Wiseman Rhododendron", "scientific_name": "Rhododendron yakushimanum 'Percy Wiseman'", "top_level": "Rhododendron", "middle_level": "Yakushimanum Hybrid", "cultivar_name": "Percy Wiseman", "cycle": "Perennial", "watering": "Average", "sunlight": ["Part shade", "Full sun"], "growth_habit": ["Shrub", "Evergreen"], "image_url": null, "uk_hardiness": "Hardy to -15°C (H5)"}], "reason": "Well-known rhododendron cultivar"}

Query: "Lavender"
→ Generic genus, identify from training data
→ {"identified": true, "confidence": "verified", "plants": [{"common_name": "Lavender", "scientific_name": "Lavandula", "top_level": "Lavender", "middle_level": "Lavender", "cultivar_name": null, "cycle": "Perennial", "watering": "Minimum", "sunlight": ["Full sun"], "growth_habit": ["Shrub", "Evergreen"], "image_url": null, "uk_hardiness": "Hardy to -15°C (H5)"}], "reason": "Common garden plant identified from training data"}

Query: "Wiseman Dahlia"
→ Search for "Wiseman Dahlia" cultivar — not found on any authoritative source
→ {"identified": false, "confidence": "unknown", "reason": "No dahlia cultivar named 'Wiseman' found on RHS, Wikipedia, or UK nursery sites"}

Query: "Percey Wiseman" (misspelled)
→ Search finds nothing for "Percey" but finds "Percy Wiseman Rhododendron" on RHS
→ {"identified": false, "confidence": "unknown", "spelling_suggestion": "Percy Wiseman", "reason": "Could not find 'Percey Wiseman' but found 'Percy Wiseman' rhododendron on RHS"}

Return ONLY valid JSON, no additional text.`
