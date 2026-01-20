// lib/ai/prompts/plant-verification.ts
// Strict plant verification prompt - identifies real plants, never invents fake ones

export interface PlantVerificationResponse {
  identified: boolean;
  confidence: 'verified' | 'likely' | 'unknown';
  plant?: {
    common_name: string;
    scientific_name: string;
    top_level: string;
    middle_level: string;
    cultivar_name: string | null;
    cycle: string;
    watering: string;
    sunlight: string[];
    growth_habit: string[];
  };
  reason?: string;
}

export const plantVerificationPrompt = (query: string) => `You are a botanical identification expert. Your task is to determine if the search query refers to a REAL plant you can verify from your training data.

Search query: "${query}"

CRITICAL RULES - FOLLOW EXACTLY:

1. ONLY IDENTIFY PLANTS YOU ARE 100% CERTAIN EXIST
   - You must have specific knowledge of this plant from your training data
   - If you cannot recall specific details about this exact plant, return "unknown"
   - Being vague or uncertain means you should return "unknown"

2. NEVER INVENT OR COMBINE PLANT NAMES
   - Do NOT attach the search term to random plant types
   - "Percy Wiseman" is NOT a Dahlia - it is a Rhododendron cultivar
   - "Percey Wiseman" (misspelled) should return "unknown" - don't guess
   - If you don't specifically know a cultivar, return "unknown"

3. CULTIVAR NAMES MUST BE EXACT MATCHES
   Only identify cultivars you specifically know:
   - "Percy Wiseman" → Rhododendron yakushimanum 'Percy Wiseman' (cream/pink flowers)
   - "Graham Thomas" → Rosa 'Graham Thomas' (yellow David Austin rose)
   - "Iceberg" → Rosa 'Iceberg' (white floribunda)
   - "Annabelle" → Hydrangea arborescens 'Annabelle' (white mopheads)

   If a cultivar name is misspelled or you don't recognize it, return "unknown".

4. WHEN IN DOUBT, SAY UNKNOWN
   - Partial matches = unknown
   - Similar-sounding names = unknown
   - Names you're not 100% sure about = unknown
   - Misspellings = unknown

5. GENERIC PLANT TYPES ARE OK
   "Rose", "Lavender", "Tomato" etc. are fine to identify generically.

Return a JSON object with this structure:

{
  "identified": true/false,
  "confidence": "verified" | "likely" | "unknown",
  "plant": {
    "common_name": "Full display name (e.g., Percy Wiseman Rhododendron)",
    "scientific_name": "Botanical name (e.g., Rhododendron 'Percy Wiseman')",
    "top_level": "Plant genus/family (e.g., Rhododendron, Rose, Hydrangea)",
    "middle_level": "Specific type within the genus (see rules below)",
    "cultivar_name": "The cultivar name if applicable (e.g., Percy Wiseman), or null",
    "cycle": "Perennial | Annual | Biennial",
    "watering": "Average | Frequent | Minimum",
    "sunlight": ["Full sun", "Part shade", "Full shade"],
    "growth_habit": ["Shrub", "Climber", "Evergreen", etc.]
  },
  "reason": "Brief explanation of identification (optional)"
}

MIDDLE_LEVEL RULES - FOLLOW EXACTLY:
- For specific cultivars/types: Use the specific type (e.g., "Yakushimanum Hybrid", "English Rose", "Mophead Hydrangea")
- For generic genus searches (e.g., "Jasmine", "Lavender", "Fuchsia"): Set middle_level to match top_level (e.g., top_level: "Jasmine", middle_level: "Jasmine")
- NEVER use generic growth habits as middle_level. These are WRONG: "Flowering Shrub", "Herbaceous Perennial", "Evergreen Tree", "Deciduous Shrub", "Climbing Plant", "Ground Cover Plant"
- The middle_level must always be plant-specific, never a generic botanical category

CONFIDENCE LEVELS:
- "verified": You have SPECIFIC, DETAILED knowledge of this exact plant from your training data
- "likely": RARELY USE THIS - only for well-known plants where you're 90%+ confident
- "unknown": DEFAULT CHOICE when you have any doubt at all

CRITICAL: Your default should be "unknown". Only return "verified" or "likely" when you have specific knowledge.

IF UNKNOWN, return:
{
  "identified": false,
  "confidence": "unknown",
  "reason": "Could not identify this as a known plant"
}

Examples:

Query: "Percy Wiseman"
Response: {"identified": true, "confidence": "verified", "plant": {"common_name": "Percy Wiseman Rhododendron", "scientific_name": "Rhododendron yakushimanum 'Percy Wiseman'", "top_level": "Rhododendron", "middle_level": "Yakushimanum Hybrid", "cultivar_name": "Percy Wiseman", "cycle": "Perennial", "watering": "Average", "sunlight": ["Part shade", "Full shade"], "growth_habit": ["Shrub", "Evergreen", "Compact"]}, "reason": "Famous yakushimanum hybrid rhododendron with pink buds opening to cream flowers"}

Query: "Percey Wiseman" (misspelled)
Response: {"identified": false, "confidence": "unknown", "reason": "Name appears misspelled, cannot verify exact cultivar"}

Query: "climbing rose"
Response: {"identified": true, "confidence": "verified", "plant": {"common_name": "Climbing Rose", "scientific_name": "Rosa (Climbing Group)", "top_level": "Rose", "middle_level": "Climbing Rose", "cultivar_name": null, "cycle": "Perennial", "watering": "Average", "sunlight": ["Full sun"], "growth_habit": ["Climber", "Deciduous", "Repeat-flowering"]}}

Query: "Jasmine"
Response: {"identified": true, "confidence": "verified", "plant": {"common_name": "Jasmine", "scientific_name": "Jasminum", "top_level": "Jasmine", "middle_level": "Jasmine", "cultivar_name": null, "cycle": "Perennial", "watering": "Average", "sunlight": ["Full sun", "Part shade"], "growth_habit": ["Shrub", "Climber"]}, "reason": "Generic jasmine - middle_level matches top_level for genus-level searches"}

Query: "Lavender"
Response: {"identified": true, "confidence": "verified", "plant": {"common_name": "Lavender", "scientific_name": "Lavandula", "top_level": "Lavender", "middle_level": "Lavender", "cultivar_name": null, "cycle": "Perennial", "watering": "Minimum", "sunlight": ["Full sun"], "growth_habit": ["Shrub", "Evergreen"]}, "reason": "Generic lavender - middle_level matches top_level for genus-level searches"}

Query: "Wiseman Dahlia"
Response: {"identified": false, "confidence": "unknown", "reason": "No known dahlia cultivar with this name - do not invent plants"}

Query: "xyzabc123"
Response: {"identified": false, "confidence": "unknown", "reason": "Not recognized as a plant name"}

Query: "blue tomato sunshine"
Response: {"identified": false, "confidence": "unknown", "reason": "Cannot verify this is a real tomato cultivar"}

Return ONLY valid JSON, no additional text.`;

export interface SpellingSuggestion {
  hasSuggestion: boolean;
  suggestion?: string;
  reason?: string;
}

export const webSearchDiscoveryPrompt = (query: string) => `You are a botanical research assistant. Your task is to SEARCH THE WEB to find and identify a plant that could not be recognized from AI training data alone.

Search query from user: "${query}"

IMPORTANT: The AI could not identify this plant from its training data. You MUST use web search to find authoritative sources.

SEARCH STRATEGY:
1. Search for the exact query on authoritative UK gardening sites first:
   - RHS (rhs.org.uk) - Royal Horticultural Society
   - BBC Gardeners' World (gardenersworld.com)
   - Wikipedia plant articles

2. If not found, try UK nursery sites:
   - Crocus (crocus.co.uk)
   - Thompson & Morgan (thompson-morgan.com)
   - David Austin Roses (davidaustinroses.co.uk) for roses

3. Search variations:
   - Try with and without quotes
   - If it looks like a cultivar name, search "[query] plant" or "[query] cultivar"

CRITICAL RULES:
1. ONLY return plant information if you find it on an authoritative source
2. If no authoritative source confirms this plant exists, return identified: false
3. Do NOT invent or guess plant information - it must come from web search results
4. Do NOT combine the user's query with random plant types
5. If you find conflicting information, prefer RHS over other sources

WHAT TO EXTRACT (if found):
- Common name (as listed on the authoritative source)
- Scientific/botanical name
- Plant family/genus (top_level)
- Specific type (middle_level) - see rules below
- Cultivar name if applicable
- Basic care requirements (cycle, watering, sunlight, growth habit)

MIDDLE_LEVEL RULES:
- For specific cultivars/types: Use the specific type (e.g., "Hybrid Tea", "Yakushimanum Hybrid")
- For generic genus searches (e.g., "Jasmine", "Lavender"): Set middle_level to match top_level
- NEVER use generic growth habits as middle_level (e.g., "Flowering Shrub", "Herbaceous Perennial", "Evergreen Tree")
- The middle_level must always be plant-specific, never a generic botanical category

Return a JSON object with this structure:

IF PLANT FOUND ON AUTHORITATIVE SOURCE:
{
  "identified": true,
  "confidence": "verified",
  "plant": {
    "common_name": "Full display name from source",
    "scientific_name": "Botanical name from source",
    "top_level": "Plant genus/family (e.g., Rose, Rhododendron)",
    "middle_level": "Specific type OR same as top_level for generic searches (NEVER a generic growth habit)",
    "cultivar_name": "Cultivar name if applicable, or null",
    "cycle": "Perennial | Annual | Biennial",
    "watering": "Average | Frequent | Minimum",
    "sunlight": ["Full sun", "Part shade", "Full shade"],
    "growth_habit": ["Shrub", "Climber", "Evergreen", etc.]
  },
  "source_url": "URL of the authoritative source",
  "reason": "Found on [source name] with full botanical information"
}

IF PLANT NOT FOUND OR CANNOT BE VERIFIED:
{
  "identified": false,
  "confidence": "unknown",
  "reason": "Detailed explanation of what was searched and why plant could not be identified"
}

Return ONLY valid JSON, no additional text.`;

export const spellingSuggestionPrompt = (query: string) => `You are a botanical assistant helping users find plants. The user searched for "${query}" but no plant was found.

Your task is to search authoritative plant sources and determine if the user may have misspelled a common plant name.

SEARCH STRATEGY:
1. Search for "${query}" and similar spellings on:
   - RHS (rhs.org.uk)
   - Wikipedia
   - UK nursery sites

2. Look for plants with names that sound similar or have common misspellings

CRITICAL RULES:
1. Only suggest a correction if you find a real plant with a similar name
2. The suggestion must be a real, verified plant from an authoritative source
3. Do NOT guess or invent plant names
4. Only suggest if the spelling is clearly close (1-2 character differences, transposed letters, etc.)

Return a JSON object:

IF SIMILAR PLANT FOUND:
{
  "hasSuggestion": true,
  "suggestion": "Correctly spelled plant name",
  "reason": "Found [plant name] on RHS - likely misspelling of user query"
}

IF NO SIMILAR PLANT FOUND:
{
  "hasSuggestion": false,
  "reason": "No similar plant names found on authoritative sources"
}

Return ONLY valid JSON, no additional text.`;

export const webSearchVerificationPrompt = (query: string, initialIdentification: string) => `You need to verify if a plant exists by searching authoritative sources.

Plant to verify: "${query}"
Initial AI identification: ${initialIdentification}

Search for this plant on authoritative gardening websites (RHS, BBC Gardeners' World, Wikipedia, plant nursery sites) and verify:
1. Does this plant actually exist?
2. Is the identification correct?
3. What is the scientific name?

Return a JSON object:
{
  "verified": true/false,
  "scientific_name": "The verified scientific name",
  "source_url": "URL of the authoritative source that confirms this plant",
  "corrections": {
    "top_level": "Corrected if wrong",
    "middle_level": "Corrected if wrong"
  }
}

If you cannot find verification, return:
{
  "verified": false,
  "reason": "Could not find authoritative source confirming this plant"
}

Return ONLY valid JSON.`;
