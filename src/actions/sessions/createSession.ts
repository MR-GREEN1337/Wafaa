"use server"

import prisma from "@/lib/prisma";
import { createSessionSchemaType, createSessionSchema } from "@/schema/session";
import { SessionStatus, SessionType } from "@/types/session";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateSession(form: createSessionSchemaType) {
    // Parse data and see if correct
    const { success, data } = createSessionSchema.safeParse(form);
    if (!success) {
        throw new Error("invalid form data");
    }

    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
        throw new Error("user not authenticated");
    }

    // First, create or find a default relationship for the user
    let relationship = await prisma.relationship.findFirst({
        where: {
            partner1Id: userId,
            // For now, we'll create a self-relationship. You can modify this later
            partner2Id: userId,
        }
    });

    if (!relationship) {
        // Create a default relationship if none exists
        relationship = await prisma.relationship.create({
            data: {
                name: "Personal Sessions",
                partner1Id: userId,
                partner2Id: userId, // Self-relationship for now
                status: "ACTIVE"
            }
        });
    }

    // Create session with proper type handling
    const sessionData = {
        userId,
        relationshipId: relationship.id, // Use the relationship we just created/found
        name: data.name,
        description: data.description || '',
        sessionType: data.sessionType || SessionType.INDIVIDUAL,
        status: SessionStatus.ACTIVE,
    };

    // Create session
    const result = await prisma.session.create({
        data: {
            ...sessionData,
            messages: {
                create: [] // Initialize with empty messages array
            }
        },
    });

    if (!result) {
        throw new Error("failed to create session");
    }

    redirect(`/dashboard/sessions/chat/${result.id}`);
}