import { NextRequest, NextResponse } from 'next/server'
import { processQuery } from '@/lib/ragService'
import { getTenantFromHeaders, getUserFromHeaders } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { getPlanLimits } from '@/lib/tenant'

export async function POST(request: NextRequest) {
  try {
    // Get tenant and user context
    const tenant = await getTenantFromHeaders()
    const user = await getUserFromHeaders()

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (tenant.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tenant is not active' },
        { status: 403 }
      )
    }

    const { message, conversationId } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check usage limits
    const planLimits = getPlanLimits(tenant.plan)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayUsage = await prisma.usage.findUnique({
      where: {
        tenantId_date_type: {
          tenantId: tenant.id,
          date: today,
          type: 'API_CALLS'
        }
      }
    })

    const currentUsage = todayUsage?.count || 0

    if (planLimits.apiCalls !== -1 && currentUsage >= planLimits.apiCalls) {
      return NextResponse.json(
        { error: 'API call limit exceeded for today' },
        { status: 429 }
      )
    }

    // Process the query with tenant context
    const response = await processQuery(message, {
      companyId: tenant.id,
      companyName: tenant.name,
      topK: 3,
      tenantContext: tenant
    })

    // Create or update conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          tenantId: tenant.id,
          status: 'ACTIVE'
        }
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 100),
          tenantId: tenant.id,
          userId: user?.id || null
        }
      })
    }

    // Save messages
    await prisma.message.createMany({
      data: [
        {
          content: message,
          role: 'USER',
          conversationId: conversation.id,
          metadata: {
            userId: user?.id,
            userEmail: user?.email
          }
        },
        {
          content: response,
          role: 'ASSISTANT',
          conversationId: conversation.id,
          metadata: {
            model: 'gpt-4',
            tokens: response.length // Approximate
          }
        }
      ]
    })

    // Update usage tracking
    await prisma.usage.upsert({
      where: {
        tenantId_date_type: {
          tenantId: tenant.id,
          date: today,
          type: 'API_CALLS'
        }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        tenantId: tenant.id,
        date: today,
        type: 'API_CALLS',
        count: 1
      }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'CHAT_MESSAGE',
        resource: 'conversation',
        resourceId: conversation.id,
        tenantId: tenant.id,
        userId: user?.id,
        userEmail: user?.email,
        metadata: {
          messageLength: message.length,
          responseLength: response.length
        }
      }
    })

    return NextResponse.json({ 
      response,
      conversationId: conversation.id,
      usage: {
        current: currentUsage + 1,
        limit: planLimits.apiCalls
      }
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}