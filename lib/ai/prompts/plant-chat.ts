import type { Plant, TaskHistory } from '@/types/database'

export function buildPlantChatPrompt(
  plant: Plant,
  history: TaskHistory[],
  userMessage: string
): string {
  const recentHistory = history
    .slice(0, 5)
    .map((h) => {
      const date = new Date(h.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
      return `- ${date}: ${h.action} "${h.task_key}"${h.notes ? ` (note: ${h.notes})` : ''}`
    })
    .join('\n')

  const tasks = plant.ai_care_profile?.tasks
    ?.map((t) => `- ${t.title} (${t.category}, ${formatMonthRange(t.month_start, t.month_end)})`)
    .join('\n')

  return `You are a friendly, knowledgeable UK gardening expert helping with a specific plant.

PLANT DETAILS:
- User's name for it: ${plant.name}
- Common name: ${plant.common_name || 'Unknown'}
- Type: ${plant.plant_type || 'Unknown'}
- Species: ${plant.species || 'Unknown'}
- Location: ${plant.area || 'Not specified'}
- Planted in: ${plant.planted_in || 'Not specified'}
- User's notes: ${plant.notes || 'None'}

CARE PROFILE:
${plant.ai_care_profile?.summary || 'No care profile generated yet.'}

Hardiness: ${plant.ai_care_profile?.uk_hardiness || 'Unknown'}

Scheduled tasks:
${tasks || 'No tasks scheduled'}

RECENT CARE HISTORY:
${recentHistory || 'No recent activity recorded'}

CURRENT DATE: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
CURRENT MONTH: ${new Date().toLocaleDateString('en-GB', { month: 'long' })}

USER'S QUESTION: ${userMessage}

RESPONSE GUIDELINES:
1. Be helpful, warm, and conversational - like a knowledgeable friend
2. All advice should be UK-specific (climate, seasons, product availability, terminology)
3. Reference the specific plant details and context provided
4. If the question relates to timing, consider the current month and scheduled tasks
5. If you don't know something specific, say so rather than guessing
6. Keep responses concise (under 200 words) unless more detail is genuinely needed
7. Use practical, actionable language
8. If recommending products, mention UK-available options (e.g., "rose feed from any garden centre")
9. Consider whether the plant is in a pot or ground when giving watering/care advice`
}

function formatMonthRange(start: number, end: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (start === end) {
    return months[start - 1]
  }
  return `${months[start - 1]}-${months[end - 1]}`
}
