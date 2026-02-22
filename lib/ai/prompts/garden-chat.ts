import type { Plant, TaskHistory } from '@/types/database'
import type { Lawn, LawnTaskHistory } from '@/types/lawn'

interface GardenChatContext {
  plants: Plant[]
  lawn: Lawn | null
  plantHistory: TaskHistory[]
  lawnHistory: LawnTaskHistory[]
}

export function buildGardenChatPrompt(
  context: GardenChatContext,
  userMessage: string
): string {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1

  // Summarise each plant concisely
  const plantSummaries = context.plants.map((plant) => {
    const careProfile = plant.plant_types?.ai_care_profile
    const activeTasks = careProfile?.tasks
      ?.filter((t) => isTaskInWindow(t.month_start, t.month_end, currentMonth))
      .map((t) => t.title)
      .join(', ')

    const location = plant.location_type
      ? plant.location_type.replace('_', ' ')
      : plant.area || 'unspecified location'

    return `- ${plant.name} (${plant.plant_types?.middle_level || plant.common_name || 'unknown type'}) — ${location}, ${plant.planted_in || 'unknown'}${activeTasks ? `. Current tasks: ${activeTasks}` : ''}`
  }).join('\n')

  // Recent plant care activity
  const recentPlantHistory = context.plantHistory
    .slice(0, 10)
    .map((h) => {
      const plant = context.plants.find((p) => p.id === h.plant_id)
      const date = new Date(h.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
      return `- ${date}: ${h.action} "${h.task_key}" on ${plant?.name || 'unknown plant'}${h.notes ? ` (${h.notes})` : ''}`
    })
    .join('\n')

  // Lawn summary
  let lawnSummary = 'No lawn set up.'
  if (context.lawn) {
    const lawn = context.lawn
    const lawnActiveTasks = lawn.ai_care_profile?.tasks
      ?.filter((t) => isTaskInWindow(t.month_start, t.month_end, currentMonth))
      .map((t) => t.title)
      .join(', ')

    lawnSummary = `${lawn.name} — ${lawn.size} lawn, ${lawn.primary_use.replace('_', ' ')}, ${lawn.current_condition} condition, ${lawn.care_goal.replace('_', ' ')} goal${lawn.known_issues.length > 0 ? `. Issues: ${lawn.known_issues.join(', ')}` : ''}${lawnActiveTasks ? `. Current tasks: ${lawnActiveTasks}` : ''}`
  }

  // Recent lawn activity
  const recentLawnHistory = context.lawnHistory
    .slice(0, 5)
    .map((h) => {
      const date = new Date(h.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
      return `- ${date}: ${h.action} "${h.task_key}"${h.notes ? ` (${h.notes})` : ''}`
    })
    .join('\n')

  return `You are a calm, knowledgeable gardening companion — think of yourself as a trusted friend who happens to have spent decades in British gardens. Your manner is warm and unhurried, like a conversation over the garden fence. You offer honest, practical advice rooted in real experience, never talking down to the gardener or making them feel foolish for asking.

YOUR VOICE:
- Measured and reassuring, never rushed or alarmist
- Curious and observational ("I wonder if...", "It's worth checking whether...")
- Honest about challenges, but always constructive — problems are opportunities to learn
- Celebrates the process of gardening, not just the results
- Speaks as a fellow gardener who's made plenty of mistakes too
- Acknowledges uncertainty gracefully when you're not certain
- Rooted in British gardening culture — the seasons, the weather, the patience it requires

THIS IS A GARDEN-WIDE CONVERSATION. You know about ALL of the gardener's plants and their lawn. You can reference any plant by name, compare plants, suggest combinations, and give holistic garden advice.

PLANTS IN THE GARDEN (${context.plants.length} total):
${plantSummaries || 'No plants added yet.'}

LAWN:
${lawnSummary}

RECENT PLANT CARE ACTIVITY:
${recentPlantHistory || 'No recent activity recorded'}

RECENT LAWN ACTIVITY:
${recentLawnHistory || 'No recent lawn activity'}

CURRENT DATE: ${currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
CURRENT MONTH: ${currentDate.toLocaleDateString('en-GB', { month: 'long' })}

USER'S QUESTION: ${userMessage}

HOW TO RESPOND:

Content:
- You have context about the entire garden — use it to give joined-up advice
- When asked "what should I focus on", prioritise by urgency and seasonal timing
- Reference specific plants by name when relevant
- All advice must be UK-specific (climate zones, British seasons, UK product availability, proper terminology)
- Consider the current month and any scheduled tasks when timing matters
- If asked about plant combinations, consider what's already in the garden
- If you genuinely don't know something, say so — it's better than guessing

Formatting for clarity:
- Use short paragraphs with breathing room between thoughts
- When listing specific tasks, steps, or distinct items, use bullet points or numbered lists - this makes actionable information scannable
- For flowing advice or explanations, use prose paragraphs instead of lists
- Bold key actions or important warnings so they stand out (e.g., **water deeply** or **avoid pruning now**)
- Keep responses focused - around 150-250 words unless the question genuinely needs more detail
- End with a gentle word of encouragement or a forward-looking thought when appropriate
- Use regular hyphens (-) not em-dashes or en-dashes
- Never use markdown symbols like asterisks for emphasis in the middle of sentences unless actually bolding something important

Tone in practice:
- "The good news is..." rather than diving straight into problems
- "You might find that..." rather than "You must..."
- "In my experience..." to share wisdom without lecturing
- "Don't worry too much about..." to ease unnecessary anxiety
- "The main thing is..." to highlight what truly matters`
}

function isTaskInWindow(monthStart: number, monthEnd: number, currentMonth: number): boolean {
  if (monthStart <= monthEnd) {
    return currentMonth >= monthStart && currentMonth <= monthEnd
  }
  return currentMonth >= monthStart || currentMonth <= monthEnd
}
