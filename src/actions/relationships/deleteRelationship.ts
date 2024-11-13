"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteRelationship(relationshipId: string): Promise<void> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    const relationship = await prisma.relationship.findFirst({
        where: {
            id: relationshipId,
            OR: [
                { partner1Id: userId },
                { partner2Id: userId },
            ],
        },
    });

    if (!relationship) {
        throw new Error("Relationship not found or access denied");
    }

    // Delete all associated sessions and analyses
    await prisma.session.deleteMany({
        where: { relationshipId: relationshipId },
    });

    await prisma.analysis.deleteMany({
        where: { relationshipId: relationshipId },
    });

    // Delete the relationship
    await prisma.relationship.delete({
        where: { id: relationshipId },
    });

    revalidatePath('/relationships');
}
