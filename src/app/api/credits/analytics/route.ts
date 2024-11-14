import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      });
  
      if (!subscription) {
        return new NextResponse("No subscription found", { status: 404 });
      }
  
      // Get analytics data
      const analytics = await prisma.$transaction([
        // Total credits earned
        prisma.creditTransaction.aggregate({
          where: {
            subscriptionId: subscription.id,
            amount: {
              gt: 0,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        // Total credits spent
        prisma.creditTransaction.aggregate({
          where: {
            subscriptionId: subscription.id,
            amount: {
              lt: 0,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        // Usage breakdown
        prisma.creditTransaction.groupBy({
            by: ['type'],
            where: {
                subscriptionId: subscription.id,
            },
            _sum: {
                amount: true,
            },
            _count: true,
            orderBy: undefined
        }),
      ]);
  
      return NextResponse.json({
        totalEarned: analytics[0]._sum.amount || 0,
        totalSpent: Math.abs(analytics[1]._sum.amount || 0),
        breakdown: analytics[2],
      });
    } catch (error) {
      console.error('[CREDITS_ANALYTICS_GET]', error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
  