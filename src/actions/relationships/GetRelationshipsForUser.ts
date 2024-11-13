"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

import React from 'react'

export async function GetRelationshipsForUser() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("user not authenticated");
    }
    
    return await prisma.relationship.findMany({
        where: {
            OR: [
                { partner1Id: userId },
                { partner2Id: userId }
            ],
            //status: "active"
        },
        select: {
            id: true,
            name: true,
            partner1: {
                select: {
                    id: true,
                    name: true
                }
            },
            partner2: {
                select: {
                    id: true,
                    name: true
                }
            },
            status: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

}

