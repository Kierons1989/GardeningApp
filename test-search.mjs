/**
 * Test script for plant search API.
 * Usage: node test-search.mjs [query]
 * Example: node test-search.mjs "iceberg"
 */
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'

// Load .env.local
const envContent = readFileSync('.env.local', 'utf-8')
for (const line of envContent.split('\n')) {
  const match = line.replace(/\r/g, '').match(/^([^=#]+)=(.*)$/)
  if (match) {
    let val = match[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[match[1].trim()] = val
  }
}

const query = process.argv[2] || 'iceberg'
console.log(`Searching for: "${query}"`)
console.log(`API key: ${process.env.ANTHROPIC_API_KEY ? 'loaded' : 'MISSING'}`)

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }]

const prompt = `You are a botanical identification expert with access to web search. Your task is to find ALL plants that match the user's search query.

Search query: "${query}"

Search RHS (rhs.org.uk) for this query. Return ALL matching variants you find, up to 6 results.

Return ONLY a JSON object:
{
  "identified": true/false,
  "confidence": "verified"/"unknown",
  "plants": [{ "common_name": "...", "scientific_name": "...", "top_level": "...", "middle_level": "...", "cultivar_name": null, "cycle": "...", "watering": "...", "sunlight": [], "growth_habit": [], "image_url": null, "uk_hardiness": null, "source_url": "..." }],
  "reason": "..."
}`

let messages = [{ role: 'user', content: prompt }]

try {
  let response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools,
    messages,
  })

  console.log(`\nstop_reason: ${response.stop_reason}, blocks: ${response.content.length}`)
  console.log(`block types: ${response.content.map(b => b.type).join(', ')}`)

  // Handle pause_turn
  let continuations = 0
  while (response.stop_reason === 'pause_turn' && continuations < 5) {
    continuations++
    console.log(`\npause_turn #${continuations}, continuing...`)
    messages = [
      { role: 'user', content: prompt },
      { role: 'assistant', content: response.content },
    ]
    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools,
      messages,
    })
    console.log(`stop_reason: ${response.stop_reason}, blocks: ${response.content.length}`)
  }

  console.log('\n--- Text blocks ---')
  for (const block of response.content) {
    if (block.type === 'text') {
      console.log(block.text)
    }
  }
} catch (error) {
  console.error(`\nAPI Error: ${error.status || 'unknown'} - ${error.error?.error?.message || error.message}`)
  if (error.status === 529) {
    console.error('Sonnet is overloaded. Try again later.')
  }
}
