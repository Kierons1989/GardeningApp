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

  return `You are a UK gardening expert. Generate a comprehensive care profile for this plant type.

PLANT TYPE: ${plantDescription}
LOCATION: ${context?.area || 'Not specified'}
PLANTED IN: ${context?.plantedIn || 'Not specified'}
CURRENT MONTH: ${monthNames[currentMonth - 1]}

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
      "why_this_matters": "string - one sentence explaining importance for plant health",
      "how_to": "string - brief practical steps (2-3 sentences)"
    }
  ],
  "tips": ["string - practical UK-specific care tips, 3-5 items"]
}

IMPORTANT GUIDELINES:
- All timing and advice should be UK-specific (climate zones 8-9, maritime climate)
- Include seasonal tasks appropriate for UK gardens
- Be practical and actionable, not generic
- For month windows that span year end (e.g., Nov-Feb), use month_start: 11, month_end: 2
- Generate 4-8 tasks covering the full year cycle
- Tasks should cover the main care activities: pruning, feeding, watering, pest control as appropriate
- Consider if the plant is in a pot vs ground (pots need more watering, winter protection)
- Tips should be genuinely useful, not obvious
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
