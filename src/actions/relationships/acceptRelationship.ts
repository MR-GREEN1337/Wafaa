'use server'

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function acceptRelationship(relationshipId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Find the relationship and ensure the user is the invitee
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: relationshipId,
        status: 'pending'
      }
    });

    if (!relationship) {
      throw new Error("Relationship not found or already accepted");
    }

    // Update the relationship status to active
    await prisma.relationship.update({
      where: { id: relationshipId },
      data: { 
        status: 'active',
        updatedAt: new Date()
      }
    });

    // Create initial analytics or welcome message if needed
    await prisma.analysis.create({
      data: {
        relationshipId,
        type: 'welcome',
        content: {
          message: "Relationship established successfully",
          timestamp: new Date().toISOString(),
        }
      }
    });

    // Revalidate the relationships page
    revalidatePath('/dashboard/relationships');
    revalidatePath(`/dashboard/relationships/${relationshipId}`);

    return { success: true };
  } catch (error) {
    console.error('Error accepting relationship:', error);
    throw error;
  }
}