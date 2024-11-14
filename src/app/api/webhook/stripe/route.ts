import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'
import { plans } from '@/lib/constants'
import { upsertPlans } from '@/helpers/upsertPlans'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  export const config = {
  api: {
    bodyParser: false,
  },
}

async function findOrCreateSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  periodStart: Date,
  periodEnd: Date
) {
  // First try to find existing subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId }
      ]
    },
    include: { plan: true }
  })

  if (subscription) {
    return prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true }
    })
  }

  // If no subscription exists, get details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const customer = await stripe.customers.retrieve(stripeCustomerId)
  
  if (customer.deleted) {
    throw new Error('Customer has been deleted')
  }

  const userId = customer.metadata?.userId
  if (!userId) {
    throw new Error('User ID not found in customer metadata')
  }

  // Get the price ID from the subscription
  const priceId = stripeSubscription.items.data[0].price.id
  
  // Find the plan in your database that corresponds to this price ID
  const plan = plans.find(plan => plan.id === priceId)

  if (!plan) {
    throw new Error(`Plan not found for price ID: ${priceId}`)
  }

  // Create new subscription
  return prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'ACTIVE',
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
    include: { plan: true }
  })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, planId: string, userId: string) {
  const customerId = subscription.customer as string
  
  const dbSubscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'ACTIVE',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  await initializeCredits(dbSubscription.id, planId)

  return dbSubscription
}

async function initializeCredits(subscriptionId: string, planId: string) {
  const plan = plans.find(p => p.id === planId)
  if (!plan) throw new Error('Plan not found')

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDay())

  await prisma.$transaction([
    prisma.creditBalance.create({ 
      data: {
        subscriptionId,
        amount: plan.monthlyCredits,
        lastRefillAt: now,
        nextRefillAt: nextMonth,
      },
    }),
    prisma.creditTransaction.create({
      data: {
        subscriptionId,
        amount: plan.monthlyCredits,
        type: 'MONTHLY_REFILL',
        description: 'Initial credit allocation',
      },
    }),
  ])
}

async function handleSubscriptionUpdated(subscriptionId: string, status: 'ACTIVE' | 'PAST_DUE') {
  return prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status },
  })
}

async function handleSubscriptionCanceled(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { credits: true },
  })

  if (!subscription) throw new Error('Subscription not found')

  // Expire remaining credits
  if (subscription.credits && subscription.credits.amount > 0) {
    await prisma.$transaction([
      prisma.creditTransaction.create({
        data: {
          subscriptionId: subscription.id,
          amount: -subscription.credits.amount,
          type: 'EXPIRATION',
          description: 'Credits expired due to subscription cancellation',
        },
      }),
      prisma.creditBalance.update({
        where: { subscriptionId: subscription.id },
        data: { amount: 0 },
      }),
    ])
  }

  return prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'CANCELED' },
  })
}

async function refillCredits(stripeSubscriptionId: string, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const periodStart = new Date(invoice.period_start * 1000)
  const periodEnd = new Date(invoice.period_end * 1000)

  // Find or create subscription
  const subscription = await findOrCreateSubscription(
    stripeSubscriptionId,
    customerId,
    periodStart,
    periodEnd
  )

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Handle credit balance
  await prisma.$transaction([
    prisma.creditBalance.upsert({
      where: { subscriptionId: subscription.id },
      create: {
        subscriptionId: subscription.id,
        amount: subscription.plan.monthlyCredits,
        lastRefillAt: now,
        nextRefillAt: nextMonth,
      },
      update: {
        amount: { increment: subscription.plan.monthlyCredits },
        lastRefillAt: now,
        nextRefillAt: nextMonth,
      },
    }),
    prisma.creditTransaction.create({
      data: {
        subscriptionId: subscription.id,
        amount: subscription.plan.monthlyCredits,
        type: 'MONTHLY_REFILL',
        description: 'Monthly credit refill',
      },
    }),
  ])

  return subscription
}

export async function POST(req: NextRequest) {
  try {

    await await upsertPlans(); // Although dumb, this is a temporary solution to ensure plans are always up-to-date
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      return new NextResponse('No signature found', { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error('Stripe webhook signature verification failed:', error);
      return new NextResponse(JSON.stringify({ error: 'Webhook signature verification failed' }), { status: 400 });
    }
    //console.log('Received body:', body);
    //console.log('Received signature:', signature);
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (!session.subscription || !session.metadata?.userId || !session.metadata?.planId) {
          throw new Error('Missing required session data')
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        console.log("Plan Id", session.metadata.planId)
        await handleSubscriptionCreated(
          subscription,
          session.metadata.planId,
          session.metadata.userId
        )
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await refillCredits(invoice.subscription as string, invoice)
          await handleSubscriptionUpdated(invoice.subscription as string, 'ACTIVE')
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await handleSubscriptionUpdated(invoice.subscription as string, 'PAST_DUE')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription.id)
        break
      }
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : error);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}