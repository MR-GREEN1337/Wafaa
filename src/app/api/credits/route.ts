import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user's subscription and associated credit balance
    const userSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE', // Only consider active subscriptions
      },
      include: {
        credits: true, // Include the CreditBalance relation
        creditTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get latest transaction to verify balance
        },
      },
    });

    if (!userSubscription) {
      return new NextResponse("No active subscription found", { status: 404 });
    }

    // If there's no credit balance record, return 0
    if (!userSubscription.credits) {
      return NextResponse.json({ credits: 0 });
    }

    // Calculate if credits need to be refilled based on nextRefillAt
    const now = new Date();
    const nextRefillDate = new Date(userSubscription.credits.nextRefillAt);
    let currentCredits = userSubscription.credits.amount;

    // If we've passed the next refill date and the subscription is active,
    // we should add the monthly credits but this should ideally be handled by a CRON job
    // This is just a failsafe
    if (now > nextRefillDate && userSubscription.status === 'ACTIVE') {
      // Add monthly credits from the subscription's plan
      const plan = await prisma.plan.findUnique({
        where: {
          id: userSubscription.planId,
        },
        select: {
          monthlyCredits: true,
        },
      });

      if (plan) {
        // Update the credit balance
        const updatedBalance = await prisma.creditBalance.update({
          where: {
            subscriptionId: userSubscription.id,
          },
          data: {
            amount: userSubscription.credits.amount + plan.monthlyCredits,
            lastRefillAt: now,
            nextRefillAt: new Date(now.setMonth(now.getMonth() + 1)),
          },
        });

        // Create a transaction record for the refill
        await prisma.creditTransaction.create({
          data: {
            subscriptionId: userSubscription.id,
            amount: plan.monthlyCredits,
            type: 'MONTHLY_REFILL',
            description: 'Monthly credit refill',
          },
        });

        currentCredits = updatedBalance.amount;
      }
    }

    return NextResponse.json({ 
      credits: currentCredits,
      nextRefillAt: userSubscription.credits.nextRefillAt,
      lastRefillAt: userSubscription.credits.lastRefillAt
    });

  } catch (error) {
    console.error('[CREDITS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}