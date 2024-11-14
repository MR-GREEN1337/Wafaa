import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the subscription for the user
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

    // Get credit transactions
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        subscriptionId: subscription.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subscription: {
          select: {
            plan: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[CREDITS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}