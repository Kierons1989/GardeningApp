import type { PlantContext } from '@/types/database'

export function buildCareProfilePrompt(
  middleLevel: string,
  topLevel?: string,
  context?: PlantContext
): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const plantDescription = topLevel ? `${middleLevel} (${topLevel})` : middleLevel
  const currentMonth = context?.currentMonth || new Date().getMonth() + 1

  // Climate zone context
  const zoneInfo = context?.climateZone
    ? `USDA Zone ${context.climateZone}`
    : 'General UK (Zone 8-9)'

  // Plant state context
  const plantState = context?.plantState
  let plantStateSection = ''
  if (plantState) {
    const stageLabels: Record<string, string> = {
      seed: 'Seeds (not yet germinated)',
      seedling: 'Seedling (recently sprouted)',
      juvenile: 'Juvenile (young but established)',
      mature: 'Mature (fully established)',
      dormant: 'Dormant (winter rest period)',
      flowering: 'Flowering',
      fruiting: 'Fruiting/producing',
    }
    const envLabels: Record<string, string> = {
      indoor: 'Indoors (windowsill/grow light)',
      outdoor: 'Outdoors in the garden',
      greenhouse: 'In a greenhouse',
      cold_frame: 'In a cold frame',
    }
    const healthLabels: Record<string, string> = {
      healthy: 'Healthy',
      struggling: 'Struggling (needs attention)',
      diseased: 'Diseased',
      recovering: 'Recovering from issues',
    }

    plantStateSection = `
CURRENT PLANT STATE:
- Growth stage: ${stageLabels[plantState.growth_stage] || plantState.growth_stage}
- Environment: ${envLabels[plantState.environment] || plantState.environment}
- Health: ${healthLabels[plantState.health_status] || plantState.health_status}${plantState.health_notes ? `\n- Health notes: ${plantState.health_notes}` : ''}${plantState.date_planted ? `\n- Date planted: ${plantState.date_planted}` : ''}

CRITICAL: Tailor ALL tasks to this plant's CURRENT STATE. For example:
- If the plant is a seedling indoors, focus on indoor care, hardening off, and transplanting — NOT winter protection or outdoor pruning
- If the plant is dormant, focus on winter care and preparation for spring
- If the plant is diseased, prioritise treatment and recovery tasks
- Adjust task timing based on the growth stage — a seed planted today has different needs than a mature plant
- Consider the environment: indoor plants don't need frost protection, greenhouse plants have different ventilation needs`
  }

  // Search data context
  const searchData = context?.searchData
  let searchDataSection = ''
  if (searchData) {
    const parts: string[] = []
    if (searchData.scientific_name) parts.push(`Scientific name: ${searchData.scientific_name}`)
    if (searchData.cycle) parts.push(`Life cycle: ${searchData.cycle}`)
    if (searchData.watering) parts.push(`Watering needs: ${searchData.watering}`)
    if (searchData.sunlight?.length) parts.push(`Sunlight: ${searchData.sunlight.join(', ')}`)
    if (searchData.growth_habit?.length) parts.push(`Growth habit: ${searchData.growth_habit.join(', ')}`)
    if (searchData.uk_hardiness) parts.push(`UK hardiness: ${searchData.uk_hardiness}`)
    if (searchData.source_url) parts.push(`Authoritative source: ${searchData.source_url}`)

    if (parts.length > 0) {
      searchDataSection = `

PREVIOUSLY VERIFIED PLANT DATA (from authoritative sources — use as baseline, supplement with web search for anything missing):
${parts.map(p => `- ${p}`).join('\n')}`
    }
  }

  return `You are a UK gardening expert. Generate a comprehensive care profile for this plant${plantState ? " based on its current state" : " type"}.

PLANT TYPE: ${plantDescription}
LOCATION: ${context?.area || 'Not specified'}
PLANTED IN: ${context?.plantedIn || 'Not specified'}
CLIMATE ZONE: ${zoneInfo}
CURRENT MONTH: ${monthNames[currentMonth - 1]}${searchDataSection}${plantStateSection}

Respond with JSON matching this exact schema:
{
  "common_name": "string - the standard UK common name for this plant",
  "species": "string or null - botanical/Latin name if known and applicable",
  "plant_type": "string - category like 'rose', 'shrub', 'perennial', 'bulb', 'lawn', 'fruit', 'vegetable', 'tree', 'climber', 'herb'",
  "summary": "string - 1-2 sentences describing the plant for a UK gardener",
  "uk_hardiness": "string - e.g., 'Hardy to -15°C' or 'Half-hardy, protect from frost'",
  "tasks": [
    {
      "key": "string - unique snake_case identifier like 'prune_winter' or 'feed_spring'",
      "title": "string - short action title like 'Winter pruning' or 'Spring feed'",
      "category": "pruning|feeding|pest_control|planting|watering|harvesting|winter_care|general",
      "month_start": 1-12,
      "month_end": 1-12,
      "recurrence_type": "once_per_window|weekly_in_window|monthly_in_window",
      "effort_level": "low|medium|high",
      "why_this_matters": "string - 1-2 sentences explaining the importance and benefits of this task",
      "how_to": "string - COMPREHENSIVE detailed guidance (4-8 paragraphs). Include: multiple approaches/methods with pros/cons, zone-specific considerations, step-by-step instructions for each method, timing nuances, what to look for, common mistakes to avoid, and options for different experience/effort levels. Be thorough and educational - this is the main instructional content."
    }
  ],
  "tips": ["string - practical UK-specific care tips, 3-5 items"]
}

IMPORTANT GUIDELINES:
- If verified plant data is provided above, use it as your starting point. Use web search to find ADDITIONAL UK-specific care guidance (especially from RHS) rather than re-discovering basic facts.
- All timing and advice should be UK-specific, tailored to the specified climate zone
- Zone 7 (coldest): Scottish Highlands - later springs, earlier frosts, more winter protection needed
- Zone 8 (moderate): Most of UK - standard UK gardening calendar
- Zone 9 (mild): Southern/coastal - earlier springs, later frosts, less winter protection
- Zone 10 (warmest): Scilly Isles/SW Cornwall - very mild, almost frost-free
- Include seasonal tasks appropriate for UK gardens and the specific climate zone
- Be practical and actionable, not generic
- For month windows that span year end (e.g., Nov-Feb), use month_start: 11, month_end: 2
- Generate 4-8 tasks covering the full year cycle
- Tasks should cover the main care activities: pruning, feeding, watering, pest control as appropriate
- Consider if the plant is in a pot vs ground (pots need more watering, winter protection)
- Tips should be genuinely useful and zone-appropriate, not obvious

CRITICAL - DETAILED "how_to" INSTRUCTIONS:
The "how_to" field is the PRIMARY educational content. It must be extensive and comprehensive:
- Present MULTIPLE valid approaches when they exist (e.g., for dahlias: lift and store, mulch in ground, bring pots inside)
- Explain the PROS and CONS of each approach
- Provide ZONE-SPECIFIC guidance (what works in Zone 9 may not work in Zone 7)
- Include DETAILED step-by-step instructions for each method
- Explain TIMING nuances and what to look for
- Highlight COMMON MISTAKES and how to avoid them
- Offer options for different SKILL/EFFORT levels
- Use paragraph breaks for readability
- Aim for 200-400 words per task - this is educational content, not a brief tip
- Write in a friendly, knowledgeable tone that educates rather than just instructs

Example of good "how_to" depth:
"There are three main approaches to overwintering dahlias, each with different trade-offs:\n\nLifting and storing (most reliable): After the first frost blackens the foliage, cut stems back to 6 inches. Carefully dig around the plant 12 inches out to avoid damaging tubers. Lift the clump, shake off loose soil, and let dry upside-down for a few days. Trim stems to 4 inches, remove damaged tubers, and store in barely-damp compost in a frost-free shed (5-10°C). Check monthly for rot. This method guarantees survival but requires storage space and effort.\n\nIn-ground with mulch (less reliable, less work): In Zone 9-10 areas, you can leave dahlias in the ground. After frost, cut back stems and apply a 6-inch layer of mulch (compost, bark, or straw) over the crown. The risk is that a severe winter can still kill tubers, and slugs may damage them in wet conditions. Only attempt this in mild areas with well-drained soil.\n\nContainer plants (easiest): Move pots into a frost-free greenhouse or shed. No need to lift - just let the plant die back naturally, cut back stems, and reduce watering to barely moist. This is the easiest method if you have space, combining protection with minimal handling."

- Return ONLY valid JSON, no markdown code blocks or explanation`
}

export const careProfileSchema = {
  type: 'object',
  properties: {
    common_name: { type: 'string' },
    species: { type: ['string', 'null'] },
    plant_type: { type: 'string' },
    summary: { type: 'string' },
    uk_hardiness: { type: 'string' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          title: { type: 'string' },
          category: {
            type: 'string',
            enum: ['pruning', 'feeding', 'pest_control', 'planting', 'watering', 'harvesting', 'winter_care', 'general']
          },
          month_start: { type: 'number', minimum: 1, maximum: 12 },
          month_end: { type: 'number', minimum: 1, maximum: 12 },
          recurrence_type: {
            type: 'string',
            enum: ['once_per_window', 'weekly_in_window', 'monthly_in_window']
          },
          effort_level: {
            type: 'string',
            enum: ['low', 'medium', 'high']
          },
          why_this_matters: { type: 'string' },
          how_to: { type: 'string' }
        },
        required: ['key', 'title', 'category', 'month_start', 'month_end', 'recurrence_type', 'effort_level', 'why_this_matters', 'how_to']
      }
    },
    tips: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['common_name', 'plant_type', 'summary', 'uk_hardiness', 'tasks', 'tips']
}
