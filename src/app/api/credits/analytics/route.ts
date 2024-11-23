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
        const [creditsEarned, creditsSpent, breakdown] = await Promise.all([
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
            // Usage breakdown - simplified groupBy
            prisma.creditTransaction.findMany({
                where: {
                    subscriptionId: subscription.id,
                },
                select: {
                    type: true,
                    amount: true,
                },
            }).then(transactions => {
                // Process the breakdown in memory instead
                return transactions.reduce((acc, curr) => {
                    const type = curr.type;
                    if (!acc[type]) {
                        acc[type] = {
                            _sum: { amount: 0 },
                            _count: 0
                        };
                    }
                    acc[type]._sum.amount += curr.amount;
                    acc[type]._count++;
                    return acc;
                }, {} as Record<string, { _sum: { amount: number }, _count: number }>);
            }),
        ]);

        return NextResponse.json({
            totalEarned: creditsEarned._sum.amount || 0,
            totalSpent: Math.abs(creditsSpent._sum.amount || 0),
            breakdown: Object.entries(breakdown).map(([type, data]) => ({
                type,
                _sum: data._sum,
                _count: data._count
            })),
        });
    } catch (error) {
        console.error('[CREDITS_ANALYTICS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}