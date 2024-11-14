import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";


export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's subscription from our database
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        NOT: {
          status: "CANCELED"
        }
      },
      select: {
        id: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        credits: true,

    }});

    if (!subscription) {
      return new NextResponse("No active subscription found", { status: 404 });
    }

    if (!subscription.stripeSubscriptionId) {
      return new NextResponse("No Stripe subscription found", { status: 404 });
    }

    // Cancel the subscription in Stripe
    // This will cancel at period end by default
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Start a transaction to update our database
    await prisma.$transaction(async (tx) => {
      // Update subscription status
      await tx.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "CANCELED",
          cancelAtPeriodEnd: true,
        },
      });

      // Log the cancellation as a credit transaction
      if (subscription.credits) {
        await tx.creditTransaction.create({
          data: {
            subscriptionId: subscription.id,
            amount: 0, //-subscription.credits.amount, // Remove all remaining credits
            type: "ADJUSTMENT",
            description: "Subscription cancellation - Credits removed",
            metadata: {
              reason: "subscription_canceled",
              previousBalance: subscription.credits.amount
            }
          }
        });
        // Update credit balance to 0
        await tx.subscription.update({
          where: {
            id: subscription.id
          },
          data: {
            credits: {
              update: {
                amount: 0
              }
            }
          }
        });}

      // Create a usage record for analytics
      await tx.usageRecord.create({
        data: {
          subscriptionId: subscription.id,
          type: "ANALYSIS",
          quantity: 1,
          creditsUsed: 0
        }
      });
    });
    // Return updated subscription data
    const updatedSubscription = await prisma.subscription.findUnique({
      where: {
        id: subscription.id,
      },
      include: {
        plan: true,
        credits: true,
        usageRecords: {
          where: {
            type: {
              in: ["SESSION", "RELATIONSHIP"]
            }
          }
        }
      }
    });

    return NextResponse.json(updatedSubscription);

  } catch (error) {
    console.error('[SUBSCRIPTION_CANCEL]', error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return new NextResponse(error.message, { status: 400 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}