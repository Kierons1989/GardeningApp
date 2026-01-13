import type { LawnSetupFormData } from '@/types/lawn'

export interface LawnContext {
  size: string
  primaryUse: string
  grassType: string
  soilType: string
  currentCondition: string
  careGoal: string
  knownIssues: string[]
  notes?: string
  currentMonth: number
}

export function buildLawnCareProfilePrompt(lawnData: LawnSetupFormData): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = new Date().getMonth() + 1
  const knownIssuesList = lawnData.known_issues?.length
    ? lawnData.known_issues.join(', ')
    : 'None reported'

  return `You are a UK lawn care expert with extensive knowledge of British grass varieties, soil types, and seasonal care requirements. Generate a comprehensive care profile for this lawn.

LAWN DETAILS:
- Size: ${lawnData.size}${lawnData.size_sqm ? ` (${lawnData.size_sqm}m²)` : ''}
- Primary Use: ${lawnData.primary_use}
- Grass Type: ${lawnData.grass_type}
- Soil Type: ${lawnData.soil_type}
- Current Condition: ${lawnData.current_condition}
- Care Goal: ${lawnData.care_goal}
- Known Issues: ${knownIssuesList}
${lawnData.notes ? `- Additional Notes: ${lawnData.notes}` : ''}

CURRENT MONTH: ${monthNames[currentMonth - 1]}

Respond with JSON matching this exact schema:
{
  "summary": "string - 2-3 sentences describing this lawn's characteristics and what the owner can expect with proper care",
  "grass_type_info": "string - 1-2 sentences about the grass type, its strengths, and specific needs",
  "uk_regional_notes": "string - 1-2 sentences about UK climate considerations for lawn care",
  "tasks": [
    {
      "key": "string - unique snake_case identifier like 'spring_feed' or 'autumn_aeration'",
      "title": "string - short action title like 'Spring fertiliser' or 'Autumn aeration'",
      "category": "mowing|feeding|aeration|scarification|overseeding|moss_control|weed_management|watering|edging|winter_care",
      "month_start": 1-12,
      "month_end": 1-12,
      "recurrence_type": "once_per_window|weekly_in_window|fortnightly_in_window|monthly_in_window",
      "effort_level": "low|medium|high",
      "why_this_matters": "string - 1-2 sentences explaining why this task is important for this specific lawn",
      "how_to": "string - COMPREHENSIVE detailed guidance (3-6 paragraphs). Include: step-by-step instructions, UK-specific product recommendations where appropriate, timing nuances, what to look for, common mistakes to avoid, and options for different effort levels. Be thorough and educational."
    }
  ],
  "tips": ["string - practical UK-specific lawn care tips, 4-6 items tailored to this lawn's specific situation"],
  "mowing_schedule": {
    "spring_height_mm": number (25-50),
    "summer_height_mm": number (25-50),
    "autumn_height_mm": number (30-50),
    "spring_frequency": "string - e.g., 'Weekly from late March'",
    "summer_frequency": "string - e.g., 'Twice weekly in peak growth'",
    "autumn_frequency": "string - e.g., 'Weekly, reducing to fortnightly'",
    "first_cut_guidance": "string - when to make the first cut of the year and how to approach it",
    "last_cut_guidance": "string - when to make the final cut and at what height"
  }
}

IMPORTANT GUIDELINES:
- All timing and advice should be UK-specific
- Tailor recommendations to the lawn's PRIMARY USE:
  * 'family' - balance appearance with durability, practical advice
  * 'ornamental' - higher standards, more detailed care
  * 'heavy_traffic' - focus on recovery and durability
  * 'shade' - shade-tolerant grass care, moss management
  * 'wildflower' - minimal intervention, encourage diversity

- Tailor recommendations to the CARE GOAL:
  * 'low_maintenance' - minimal essential tasks only, keep it simple
  * 'family_friendly' - practical balanced care without obsessing
  * 'pristine' - comprehensive care for the best possible lawn
  * 'wildlife' - eco-friendly approaches, less intensive

- Address the KNOWN ISSUES specifically in relevant tasks
- Consider SOIL TYPE when recommending aeration, feeding, and watering
- Consider CURRENT CONDITION when prioritizing tasks

TASK GUIDELINES:
- Generate 6-10 tasks covering the full year cycle
- Essential tasks for most lawns:
  * Spring feed (March-April)
  * Autumn feed (September-October)
  * Scarification (September-October for most lawns)
  * Aeration (autumn or spring depending on soil)
- Additional tasks based on issues and goals:
  * Moss control if moss is reported
  * Weed management if weeds are reported
  * Overseeding if bare patches or condition is poor
  * Watering guidance for sandy soil or drought issues
- DO NOT include 'mowing' as a task - mowing schedule is handled separately
- For month windows that span year end (e.g., Nov-Feb), use month_start: 11, month_end: 2

MOWING SCHEDULE GUIDELINES:
- Adjust heights based on grass type and use:
  * Fine fescue/bent: can go lower (25-30mm ornamental, 30-35mm family)
  * Perennial ryegrass: medium (30-40mm)
  * Shade lawns: keep higher (40-50mm) to help grass compete
  * Heavy traffic: keep higher (35-45mm) for recovery
- Never remove more than one-third of blade height at once
- Mowing typically March-November, but varies by weather

CRITICAL - DETAILED "how_to" INSTRUCTIONS:
The "how_to" field is the PRIMARY educational content. It must be comprehensive:
- Provide STEP-BY-STEP instructions
- Recommend UK-AVAILABLE products/approaches where relevant
- Explain TIMING nuances (weather conditions, ground temperature)
- Highlight COMMON MISTAKES and how to avoid them
- Tailor advice to the lawn's specific situation
- Use paragraph breaks for readability
- Aim for 150-300 words per task

- Return ONLY valid JSON, no markdown code blocks or explanation`
}

export const lawnCareProfileSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    grass_type_info: { type: 'string' },
    uk_regional_notes: { type: 'string' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          title: { type: 'string' },
          category: {
            type: 'string',
            enum: ['mowing', 'feeding', 'aeration', 'scarification', 'overseeding', 'moss_control', 'weed_management', 'watering', 'edging', 'winter_care']
          },
          month_start: { type: 'number', minimum: 1, maximum: 12 },
          month_end: { type: 'number', minimum: 1, maximum: 12 },
          recurrence_type: {
            type: 'string',
            enum: ['once_per_window', 'weekly_in_window', 'fortnightly_in_window', 'monthly_in_window']
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
    },
    mowing_schedule: {
      type: 'object',
      properties: {
        spring_height_mm: { type: 'number' },
        summer_height_mm: { type: 'number' },
        autumn_height_mm: { type: 'number' },
        spring_frequency: { type: 'string' },
        summer_frequency: { type: 'string' },
        autumn_frequency: { type: 'string' },
        first_cut_guidance: { type: 'string' },
        last_cut_guidance: { type: 'string' }
      },
      required: ['spring_height_mm', 'summer_height_mm', 'autumn_height_mm', 'spring_frequency', 'summer_frequency', 'autumn_frequency', 'first_cut_guidance', 'last_cut_guidance']
    }
  },
  required: ['summary', 'grass_type_info', 'uk_regional_notes', 'tasks', 'tips', 'mowing_schedule']
}
