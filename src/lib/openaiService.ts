import OpenAI from 'openai'
import { PersonalityConfig } from './personalityService'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}

export async function generateResponse(
  query: string,
  context: string,
  personality: PersonalityConfig,
  companyName: string
): Promise<string> {
  try {
    // Build system prompt using personality configuration
    const systemPrompt = buildSystemPrompt(query, context, personality, companyName)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return response.choices[0].message.content || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Error generating response:', error)
    throw error
  }
}

function buildSystemPrompt(
  query: string,
  context: string,
  personality: PersonalityConfig,
  companyName: string
): string {
  const philosophyText = Object.entries(personality.philosophy)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  const valuesText = Object.entries(personality.values)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  let systemPrompt = `You are Solveur, an AI business assistant for ${companyName}.

PERSONALITY:
- Tone: ${personality.tone}
- Style: ${personality.style}
- Expertise: ${personality.expertise.join(', ')}

PHILOSOPHICAL FOUNDATIONS:
${philosophyText}

CORE VALUES:
${valuesText}

BRAND VOICE:
${personality.brandVoice || `${companyName} is committed to excellence and customer satisfaction.`}

INSTRUCTIONS:
- Use the provided context to answer questions accurately and helpfully
- Maintain the specified tone and style in your responses
- If the context doesn't contain relevant information, say so politely and offer to help in other ways
- Keep responses ${personality.responseLength} in length
- Respond in ${personality.language}

${personality.customPrompt ? `ADDITIONAL INSTRUCTIONS: ${personality.customPrompt}` : ''}

Context: ${context}`

  return systemPrompt
}