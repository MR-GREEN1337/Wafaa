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
  
      // Get user's canceled subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: "CANCELED",
          cancelAtPeriodEnd: true,
        },
        select: {
          id: true,
          stripeSubscriptionId: true,
        }
      });
  
      if (!subscription?.stripeSubscriptionId) {
        return new NextResponse("No canceled subscription found", { status: 404 });
      }
  
      // Reactivate the subscription in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
  
      // Update our database
      const updatedSubscription = await prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
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
      console.error('[SUBSCRIPTION_REACTIVATE]', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        return new NextResponse(error.message, { status: 400 });
      }
      
      return new NextResponse("Internal Error", { status: 500 });
    }
  }