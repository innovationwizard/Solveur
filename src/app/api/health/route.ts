import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      openai: 'unknown',
      pinecone: 'unknown'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPineconeKey: !!process.env.PINECONE_API_KEY,
      hasPineconeHost: !!process.env.PINECONE_HOST,
      hasPineconeIndex: !!process.env.PINECONE_INDEX_NAME
    }
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    health.services.database = 'healthy'
  } catch (error) {
    health.services.database = 'unhealthy'
    health.status = 'degraded'
    console.error('Database health check failed:', error)
  }

  // Test OpenAI (if configured)
  if (process.env.OPENAI_API_KEY) {
    try {
      const { generateEmbedding } = await import('@/lib/openaiService')
      await generateEmbedding('test')
      health.services.openai = 'healthy'
    } catch (error) {
      health.services.openai = 'unhealthy'
      health.status = 'degraded'
      console.error('OpenAI health check failed:', error)
    }
  } else {
    health.services.openai = 'not_configured'
  }

  // Test Pinecone (if configured)
  if (process.env.PINECONE_API_KEY && process.env.PINECONE_HOST && process.env.PINECONE_INDEX_NAME) {
    try {
      const { searchSimilarContent } = await import('@/lib/pineconeService')
      await searchSimilarContent([0.1, 0.2, 0.3], 'test', 1)
      health.services.pinecone = 'healthy'
    } catch (error) {
      health.services.pinecone = 'unhealthy'
      health.status = 'degraded'
      console.error('Pinecone health check failed:', error)
    }
  } else {
    health.services.pinecone = 'not_configured'
  }

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
