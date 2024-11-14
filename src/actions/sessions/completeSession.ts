"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { SessionStatus } from "@/types/session";

export async function completeSession(sessionId: string) {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { userId: true, status: true }
    });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.userId !== userId) {
        throw new Error("Unauthorized");
    }

    if (session.status === SessionStatus.COMPLETED) {
        throw new Error("Session is already completed");
    }

    return await prisma.session.update({
        where: { id: sessionId },
        data: { status: SessionStatus.COMPLETED }
    });
}