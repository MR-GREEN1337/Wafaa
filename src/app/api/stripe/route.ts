import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch user's subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true }
    });

    if (!subscription) {
      return new NextResponse(
        JSON.stringify({ subscription: null }),
        { status: 200 }
      );
    }

    //console.log("Subscription dat", subscription)

    // If subscription exists, fetch usage records from Stripe
    const stripeSubscription = subscription.stripeSubscriptionId ? await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    ) : null;

    // Check if stripeSubscription and items exist
    const usageRecords = stripeSubscription && stripeSubscription.items.data.length > 0 ? await Promise.all([
      stripe.subscriptionItems.listUsageRecordSummaries(
        stripeSubscription.items.data[0].id,
        { limit: 1 }
      ),
      stripeSubscription.items.data.length > 1 ? stripe.subscriptionItems.listUsageRecordSummaries(
        stripeSubscription.items.data[1].id,
        { limit: 1 }
      ) : null // Handle case where there is no second item
    ]) : null;

    const formattedUsageRecords = [
      {
        type: 'SESSION',
        quantity: usageRecords?.[0]?.data?.[0]?.total_usage || 0
      },
      {
        type: 'RELATIONSHIP',
        quantity: usageRecords?.[1]?.data?.[0]?.total_usage || 0
      }
    ];

    const result = JSON.stringify({
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        price: subscription.plan.price,
        description: subscription.plan.description,
        features: subscription.plan.features,
        sessionLimit: subscription.plan.sessionLimit,
        relationshipLimit: subscription.plan.relationshipLimit
      },
      usageRecords: formattedUsageRecords
    });

    return new NextResponse(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { planId } = await req.json()
    // Get user email from Clerk
    const user = await (await clerkClient()).users.getUser(userId)
    //console.log("useer", user)
    const userEmail = user.emailAddresses[0]?.emailAddress

    if (!userEmail) {
      return new NextResponse('User email not found', { status: 400 })
    }

    const user_db = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!user_db) {
      await prisma.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: user.firstName ? user.firstName : userEmail.split('@')[0],
        }
      })
    }

    // Fetch the user's current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    // Create or get Stripe customer
    let customerId = currentSubscription?.stripeCustomerId

    // Create new customer, this will initite webhook to create user subscription
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      })
      customerId = customer.id
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId,
          quantity: 1
        }
      ],
      metadata: {
        userId: userId,
        planId: planId
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    })

    return new NextResponse(JSON.stringify({ url: checkoutSession.url }))
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}