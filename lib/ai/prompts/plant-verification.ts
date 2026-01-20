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
    "middle_level": "Specific type (e.g., Yakushimanum Hybrid, English Rose, Mophead Hydrangea)",
    "cultivar_name": "The cultivar name if applicable (e.g., Percy Wiseman), or null",
    "cycle": "Perennial | Annual | Biennial",
    "watering": "Average | Frequent | Minimum",
    "sunlight": ["Full sun", "Part shade", "Full shade"],
    "growth_habit": ["Shrub", "Climber", "Evergreen", etc.]
  },
  "reason": "Brief explanation of identification (optional)"
}

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

Query: "Wiseman Dahlia"
Response: {"identified": false, "confidence": "unknown", "reason": "No known dahlia cultivar with this name - do not invent plants"}

Query: "xyzabc123"
Response: {"identified": false, "confidence": "unknown", "reason": "Not recognized as a plant name"}

Query: "blue tomato sunshine"
Response: {"identified": false, "confidence": "unknown", "reason": "Cannot verify this is a real tomato cultivar"}

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
