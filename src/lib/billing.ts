import Stripe from 'stripe'
import { prisma } from './prisma'
import { getPlanLimits } from './tenant'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    stripePriceId: null,
    limits: getPlanLimits('FREE')
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    limits: getPlanLimits('STARTER')
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 99,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    limits: getPlanLimits('PROFESSIONAL')
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: getPlanLimits('ENTERPRISE')
  }
}

export async function createStripeCustomer(tenantId: string, email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenantId
      }
    })

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customer.id }
    })

    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

export async function createCheckoutSession(tenantId: string, priceId: string, successUrl: string, cancelUrl: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    let customerId = tenant.stripeCustomerId

    if (!customerId) {
      const customer = await createStripeCustomer(tenantId, 'admin@example.com', tenant.name)
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId
      }
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const tenantId = subscription.metadata.tenantId

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionId: subscription.id,
        plan: getPlanFromStripePriceId(subscription.items.data[0].price.id),
        status: 'ACTIVE'
      }
    })
  } catch (error) {
    console.error('Error handling subscription created:', error)
    throw error
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const tenantId = subscription.metadata.tenantId

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: getPlanFromStripePriceId(subscription.items.data[0].price.id),
        status: subscription.status === 'active' ? 'ACTIVE' : 'SUSPENDED'
      }
    })
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    throw error
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const tenantId = subscription.metadata.tenantId

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: 'FREE',
        status: 'ACTIVE',
        subscriptionId: null
      }
    })
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
    throw error
  }
}

function getPlanFromStripePriceId(priceId: string): 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' {
  const plans = Object.values(PLANS)
  const plan = plans.find(p => p.stripePriceId === priceId)
  return (plan?.id.toUpperCase() as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') || 'FREE'
}

export async function getUsageStats(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const usage = await prisma.usage.findMany({
    where: {
      tenantId,
      date: {
        gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  return usage
}

export async function checkUsageLimits(tenantId: string, type: string, count: number = 1) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const planLimits = getPlanLimits(tenant.plan)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayUsage = await prisma.usage.findUnique({
    where: {
      tenantId_date_type: {
        tenantId,
        date: today,
        type: type as any
      }
    }
  })

  const currentUsage = todayUsage?.count || 0
  const limit = planLimits[type as keyof typeof planLimits]

  if (limit !== -1 && currentUsage + count > limit) {
    return {
      allowed: false,
      current: currentUsage,
      limit,
      remaining: Math.max(0, limit - currentUsage)
    }
  }

  return {
    allowed: true,
    current: currentUsage,
    limit,
    remaining: limit === -1 ? -1 : limit - currentUsage
  }
} 