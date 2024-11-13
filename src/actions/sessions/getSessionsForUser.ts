"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from '@/lib/prisma';

export async function GetSessionsForUser() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    return prisma.session.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}