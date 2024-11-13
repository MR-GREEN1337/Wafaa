import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to initialize credit balance for a subscription
// If user paid subscription, send mail to thank for subscription
async function initializeCreditBalance(subscriptionId: string, plan: any) {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  await prisma.creditBalance.create({
    data: {
      subscriptionId,
      amount: plan.monthlyCredits,
      lastRefillAt: now,
      nextRefillAt: nextMonth
    }
  })

  // Record the initial credit transaction
  await prisma.creditTransaction.create({
    data: {
      subscriptionId,
      amount: plan.monthlyCredits,
      type: 'MONTHLY_REFILL',
      description: 'Initial credit allocation'
    }
  })
}

// Helper function to refill credits for subscription renewal
async function refillCredits(subscriptionId: string, plan: any) {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Update credit balance
  await prisma.creditBalance.update({
    where: { subscriptionId },
    data: {
      amount: plan.monthlyCredits,
      lastRefillAt: now,
      nextRefillAt: nextMonth
    }
  })

  // Record the refill transaction
  await prisma.creditTransaction.create({
    data: {
      subscriptionId,
      amount: plan.monthlyCredits,
      type: 'MONTHLY_REFILL',
      description: 'Monthly credit refill'
    }
  })
}

// Helper function to handle credit expiration
async function expireCredits(subscriptionId: string) {
  const creditBalance = await prisma.creditBalance.findUnique({
    where: { subscriptionId }
  })

  if (creditBalance && creditBalance.amount > 0) {
    // Record the expiration transaction
    await prisma.creditTransaction.create({
      data: {
        subscriptionId,
        amount: -creditBalance.amount,
        type: 'EXPIRATION',
        description: 'Credits expired due to subscription cancellation'
      }
    })

    // Set balance to 0
    await prisma.creditBalance.update({
      where: { subscriptionId },
      data: { amount: 0 }
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    console.log('Received Stripe webhook event:', event.type)

    // Type guard function to check if session has subscription property
    const hasSubscription = (obj: any): obj is { subscription: string } => {
      return 'subscription' in obj
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (!hasSubscription(session)) {
          throw new Error('No subscription found in session')
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription)

        if (!session.metadata?.userId || !session.metadata?.planId) {
          throw new Error('Missing required metadata')
        }

        // Get plan details for credit initialization
        const plan = await prisma.plan.findUnique({
          where: { id: session.metadata.planId }
        })

        if (!plan) {
          throw new Error('Plan not found')
        }

        // Create or update subscription
        const dbSubscription = await prisma.subscription.upsert({
          where: { userId: session.metadata.userId },
          update: {
            status: 'ACTIVE',
            planId: session.metadata.planId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
          create: {
            userId: session.metadata.userId,
            planId: session.metadata.planId,
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        })

        // Initialize credit balance for new subscription
        await initializeCreditBalance(dbSubscription.id, plan)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (!invoice.subscription) {
          throw new Error('No subscription found in invoice')
        }

        // Get subscription and plan details
        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string },
          include: { plan: true }
        })

        if (!dbSubscription) {
          throw new Error('Subscription not found in database')
        }

        // Update subscription status and period
        await prisma.subscription.update({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: {
            status: 'ACTIVE',
            currentPeriodEnd: new Date(invoice.period_end * 1000)
          }
        })

        // Refill credits for the new billing period
        await refillCredits(dbSubscription.id, dbSubscription.plan)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (!invoice.subscription) {
          throw new Error('No subscription found in invoice')
        }

        await prisma.subscription.update({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: {
            status: 'PAST_DUE'
          }
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        })

        if (!dbSubscription) {
          throw new Error('Subscription not found in database')
        }

        // Expire any remaining credits
        await expireCredits(dbSubscription.id)

        // Update subscription status
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED'
          }
        })
        break
      }

      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge
        // Log the successful charge
        console.log('Charge succeeded:', charge.id)
        // You can add additional processing here if needed
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Log the successful payment intent
        console.log('Payment intent succeeded:', paymentIntent.id)
        // You can add additional processing here if needed
        break
      }

      case 'payment_intent.created': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Log the payment intent creation
        console.log('Payment intent created:', paymentIntent.id)
        // You can add additional processing here if needed
        break
      }

      default: {
        // Log unhandled event types
        console.log(`Unhandled event type: ${event.type}`)
      }
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook error', { status: 400 })
  }
}