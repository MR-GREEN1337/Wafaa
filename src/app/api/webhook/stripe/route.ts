import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'
import { plans } from '@/lib/constants'
import { upsertPlans } from '@/helpers/upsertPlans'
import { Resend } from 'resend'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
const resend = new Resend(process.env.RESEND_API_KEY)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function initializeCredits(subscriptionId: string, plan: any) {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  console.log('Initializing credits for subscription:', subscriptionId, 'with amount:', plan.monthlyCredits)

  return prisma.$transaction([
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

async function findOrCreateSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  periodStart: Date,
  periodEnd: Date
) {
  console.log('Finding or creating subscription:', stripeSubscriptionId)
  
  // First try to find existing subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId }
      ]
    },
    include: { plan: true, credits: true }
  })

  if (subscription) {
    console.log('Found existing subscription:', subscription.id)
    return prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true, credits: true }
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

  const priceId = stripeSubscription.items.data[0].price.id
  const plan = plans.find(plan => plan.id === priceId)

  if (!plan) {
    throw new Error(`Plan not found for price ID: ${priceId}`)
  }

  console.log('Creating new subscription for user:', userId)
  
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
    include: { plan: true, credits: true }
  })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, planId: string, userId: string) {
  console.log('Handling subscription created:', subscription.id)
  
  const customerId = subscription.customer as string
  
  const customer = await stripe.customers.retrieve(customerId);
  const userEmail = customer.deleted ? null : customer.email;
  
  const plan = plans.find(p => p.id === planId);
  if (!plan) throw new Error('Plan not found');
  
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
    include: { credits: true }
  })

  // Initialize credits immediately for new subscriptions
  if (!dbSubscription.credits) {
    console.log('Initializing credits for new subscription')
    await initializeCredits(dbSubscription.id, plan)
  }

  if (userEmail) {
    await sendWelcomeEmail(userEmail, plan.name);
  }

  return dbSubscription
}

async function handleSubscriptionUpdated(subscriptionId: string, status: 'ACTIVE' | 'PAST_DUE') {
  console.log('Updating subscription status:', subscriptionId, status)
  return prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status },
  })
}

async function handleSubscriptionCanceled(subscriptionId: string) {
  console.log('Canceling subscription:', subscriptionId)
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { credits: true },
  })

  if (!subscription) throw new Error('Subscription not found')

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

async function handleMonthlyRefill(subscription: any) {
  console.log('Processing monthly refill for subscription:', subscription.id)
  
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  await prisma.$transaction([
    prisma.creditBalance.update({
      where: { subscriptionId: subscription.id },
      data: {
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
}

async function refillCredits(stripeSubscriptionId: string, invoice: Stripe.Invoice) {
  console.log('Processing refill credits for subscription:', stripeSubscriptionId)
  
  const customerId = invoice.customer as string
  const periodStart = new Date(invoice.period_start * 1000)
  const periodEnd = new Date(invoice.period_end * 1000)

  const subscription = await findOrCreateSubscription(
    stripeSubscriptionId,
    customerId,
    periodStart,
    periodEnd
  )

  // Handle monthly refills only for existing credit balances
  if (subscription.credits) {
    console.log('Processing monthly refill for existing subscription')
    await handleMonthlyRefill(subscription)
  } else {
    // This is a safety net - initialize credits if they don't exist
    console.log('No credits found, initializing credits')
    await initializeCredits(subscription.id, subscription.plan)
  }

  return subscription
}

async function sendWelcomeEmail(userEmail: string, planName: string) {
  try {
    await resend.emails.send({
      from: 'Your App <notifications@wafaa.com>',
      to: userEmail,
      subject: 'Welcome to Your App!',
      html: `
        <h1>Welcome to Your App!</h1>
        <p>Thank you for subscribing to our ${planName} plan. We're excited to have you on board!</p>
        <p>Here's what you can expect:</p>
        <ul>
          <li>Your subscription is now active</li>
          <li>Your credits have been added to your account</li>
          <li>You can start using all features immediately</li>
        </ul>
        <p>If you have any questions, don't hesitate to reach out to our support team.</p>
      `
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await upsertPlans();
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

    console.log('Received webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (!session.subscription || !session.metadata?.userId || !session.metadata?.planId) {
          throw new Error('Missing required session data')
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
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