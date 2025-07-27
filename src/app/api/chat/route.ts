import { NextRequest, NextResponse } from 'next/server'
import { processQuery } from '@/lib/ragService'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // For demo purposes, using 'demo-company' as default
    // In production, this would be determined by authentication/routing
    const response = await processQuery(message, {
      companyId: 'demo-company',
      companyName: 'Demo Business Solutions',
      topK: 3
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}