import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

export async function generateResponse(
  query: string,
  context: string,
  companyName: string = 'your company'
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are Solveur, an AI business assistant for ${companyName}. Use the provided context to answer questions accurately and helpfully. If the context doesn't contain relevant information, say so politely and offer to help in other ways.

Context: ${context}`
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