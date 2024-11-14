"use server"

import prisma from "@/lib/prisma";
import { createSessionSchemaType, createSessionSchema } from "@/schema/session";
import { SessionStatus, SessionType } from "@/types/session";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkAndDeductCredits, InsufficientCreditsError } from "@/lib/credits";
import { UsageType } from "@prisma/client";
import { NextResponse } from "next/server";

// Define a type for the serializable response
type SerializableSessionResponse = {
  id: string;
  name: string;
  description: string;
  sessionType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
    
export async function CreateSession(form: createSessionSchemaType) {
    try {
        const { success, data } = createSessionSchema.safeParse(form);
        if (!success) {
            throw new Error("invalid form data");
        }
    
        const { userId } = await auth();
        if (!userId) {
            throw new Error("user not authenticated");
        }
    
        await checkAndDeductCredits(userId, UsageType.SESSION);
    
        // Find or create relationship with serializable response
        const relationship = await prisma.relationship.findFirst({
            where: {
                partner1Id: userId,
                partner2Id: userId,
            },
            select: {
                id: true,
                name: true,
                status: true
            }
        });
    
        const relationshipId = relationship ? relationship.id : await createDefaultRelationship(userId);
    
        // Create session with explicit type selection
        const result = await prisma.session.create({
            data: {
                userId,
                relationshipId,
                name: data.name,
                description: data.description || '',
                sessionType: data.sessionType || SessionType.INDIVIDUAL,
                status: SessionStatus.ACTIVE,
                messages: {
                    create: []
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                sessionType: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
    
        if (!result) {
            throw new Error("failed to create session");
        }

        // Serialize dates before returning
        const serializedResult: SerializableSessionResponse = {
            ...result,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString()
        };
    
        redirect(`/dashboard/sessions/chat/${serializedResult.id}`);
    } catch (error) {
        if (error instanceof InsufficientCreditsError) {
            return new NextResponse("Insufficient credits", { status: 402 });
        }
        console.error("Session creation error:", error);
        throw error;
    }
}

async function createDefaultRelationship(userId: string): Promise<string> {
    const relationship = await prisma.relationship.create({
        data: {
            name: "Personal Sessions",
            partner1Id: userId,
            partner2Id: userId,
            status: "ACTIVE"
        },
        select: {
            id: true
        }
    });
    return relationship.id;
}