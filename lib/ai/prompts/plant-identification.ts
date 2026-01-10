// lib/ai/prompts/plant-identification.ts

export const plantIdentificationPrompt = (userInput: string) => `You are a UK gardening expert specializing in plant taxonomy. Your task is to identify the hierarchical classification of a plant from user input.

User input: "${userInput}"

Extract and return a JSON object with the following structure:

{
  "top_level": "The broad plant group (e.g., Rose, Hydrangea, Dahlia, Tomato, Clematis)",
  "middle_level": "The specific type within the group (e.g., Hybrid Tea Rose, Floribunda Rose, Climbing Rose, Mophead Hydrangea, Paniculata Hydrangea, Dinner Plate Dahlia, Pompom Dahlia, Cherry Tomato, Beefsteak Tomato)",
  "cultivar_name": "The specific variety/cultivar name if identifiable (e.g., Iceberg, Peace, Runaway Bride, Sungold), or null if not specified or not a named cultivar",
  "growth_habit": ["Array of relevant tags: Shrub, Climber, Perennial, Annual, Repeat-flowering, Evergreen, Deciduous, etc."],
  "confidence": "high | medium | low - your confidence in this identification"
}

Guidelines:

1. **Top Level**: The general plant family or common grouping. Examples:
   - Rose (not "Roses" - always singular)
   - Hydrangea
   - Dahlia
   - Tomato (not "Tomato Plant")
   - Clematis
   - Lavender
   - Hosta

2. **Middle Level**: The specific type that determines care requirements. This is critical as care profiles are generated at this level. Examples:
   - For Roses: "Hybrid Tea Rose", "Floribunda Rose", "Climbing Rose", "Shrub Rose", "Rambling Rose", "Ground Cover Rose"
   - For Hydrangeas: "Mophead Hydrangea", "Lacecap Hydrangea", "Paniculata Hydrangea", "Climbing Hydrangea"
   - For Dahlias: "Dinner Plate Dahlia", "Pompom Dahlia", "Cactus Dahlia", "Decorative Dahlia"
   - For Tomatoes: "Cherry Tomato", "Beefsteak Tomato", "Plum Tomato", "Vine Tomato"
   - For Clematis: "Large-flowered Clematis", "Viticella Clematis", "Montana Clematis"

3. **Cultivar Name**: Extract if present. Common patterns:
   - "Iceberg Rose" → cultivar: "Iceberg"
   - "Runaway Bride Hydrangea" → cultivar: "Runaway Bride"
   - "Sungold Cherry Tomato" → cultivar: "Sungold"
   - "Just a rose" → cultivar: null
   - If unsure, set to null

4. **Growth Habit**: Select all that apply from UK gardening context:
   - Growth form: Shrub, Climber, Tree, Perennial, Annual, Biennial, Bulb, Grass, Fern
   - Characteristics: Evergreen, Deciduous, Semi-evergreen
   - Flowering: Repeat-flowering, Once-flowering, Spring-flowering, Summer-flowering
   - Size: Compact, Dwarf, Standard, Large
   - Other: Scented, Thornless, Edible, Native, Drought-tolerant

5. **Confidence**:
   - high: Clear, unambiguous plant name with known taxonomy
   - medium: Recognizable plant but some ambiguity in classification
   - low: Unusual input, unclear, or multiple possible interpretations

Examples:

Input: "Iceberg climbing rose"
Output: {"top_level": "Rose", "middle_level": "Climbing Rose", "cultivar_name": "Iceberg", "growth_habit": ["Climber", "Repeat-flowering", "Scented"], "confidence": "high"}

Input: "Runaway Bride"
Output: {"top_level": "Hydrangea", "middle_level": "Paniculata Hydrangea", "cultivar_name": "Runaway Bride", "growth_habit": ["Shrub", "Deciduous", "Summer-flowering"], "confidence": "high"}

Input: "cherry tomato sungold"
Output: {"top_level": "Tomato", "middle_level": "Cherry Tomato", "cultivar_name": "Sungold", "growth_habit": ["Annual", "Edible", "Vine"], "confidence": "high"}

Input: "clematis"
Output: {"top_level": "Clematis", "middle_level": "Large-flowered Clematis", "cultivar_name": null, "growth_habit": ["Climber", "Deciduous"], "confidence": "medium"}

Input: "some purple flower"
Output: {"top_level": "Unknown", "middle_level": "Unknown", "cultivar_name": null, "growth_habit": [], "confidence": "low"}

Return ONLY valid JSON, no additional text.`;
