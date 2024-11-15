"use server"

import prisma from "@/lib/prisma";
import { createSessionSchemaType, createSessionSchema } from "@/schema/session";
import { SessionStatus, SessionType } from "@/types/session";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkAndDeductCredits, InsufficientCreditsError } from "@/lib/credits";
import { UsageType } from "@prisma/client";
import { NextResponse } from "next/server";

type CreateSessionResponse = {
  success: boolean;
  data?: {
    id: string;
    redirectUrl: string;
  };
  error?: string;
};

export async function CreateSession(form: createSessionSchemaType): Promise<CreateSessionResponse> {
    try {
        const { success, data } = createSessionSchema.safeParse(form);
        if (!success) {
            return {
                success: false,
                error: "Invalid form data"
            };
        }
    
        const { userId } = await auth();
        if (!userId) {
            return {
                success: false,
                error: "User not authenticated"
            };
        }
    
        try {
            await checkAndDeductCredits(userId, UsageType.SESSION);
        } catch (error) {
            if (error instanceof InsufficientCreditsError) {
                return {
                    success: false,
                    error: "Insufficient credits"
                };
            }
            throw error;
        }
    
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
            return {
                success: false,
                error: "Failed to create session"
            };
        }
    
        return {
            success: true,
            data: {
                id: result.id,
                redirectUrl: `/dashboard/sessions/chat/${result.id}`
            }
        };
    } catch (error) {
        console.error("Session creation error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
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