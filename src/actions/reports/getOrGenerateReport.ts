"use server"

import prisma from "@/lib/prisma";
import { generateConsolidatedAnalysis, generateDefaultAnalysis } from "../reports/consolidatedReport";
import { revalidatePath } from "next/cache";

const ANALYSIS_CACHE_TIME = 10* 24 * 60 * 60 * 1000; // 10 days in milliseconds

export async function getOrGenerateAnalysis(userId: string, forceRefresh = false) {
  if (forceRefresh) {
    // Delete previous analysis
    await prisma.consolidatedAnalysis.deleteMany({
      where: {
        userId
      }
    });
  } else {
    // Check for existing analysis that's not expired
    const existingAnalysis = await prisma.consolidatedAnalysis.findFirst({
      where: {
        userId,
        updatedAt: {
          gte: new Date(Date.now() - ANALYSIS_CACHE_TIME)
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (existingAnalysis) {
      return existingAnalysis.analysis;
    }
  }

  // Generate new analysis
  const messages = await prisma.message.findMany({
    where: {
      session: {
        OR: [
          { relationship: { partner1Id: userId } },
          { relationship: { partner2Id: userId } }
        ]
      }
    },
    include: {
      session: {
        include: {
          relationship: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const uniquePartners = new Set(
    messages.map(m => 
      m.session.relationship.partner1Id === userId 
        ? m.session.relationship.partner2Id 
        : m.session.relationship.partner1Id
    )
  );

  const analysis = messages.length > 0 
    ? await generateConsolidatedAnalysis(messages, userId)
    : await generateDefaultAnalysis();

  const finalAnalysis = {
    ...analysis,
    uniquePartners: uniquePartners.size,
    totalInteractions: messages.length
  };

  // Store the new analysis
  await prisma.consolidatedAnalysis.create({
    data: {
      userId,
      analysis: finalAnalysis as any
    }
  });

  return finalAnalysis;
}

export async function refreshAnalysis(userId: string) {
  const newAnalysis = await getOrGenerateAnalysis(userId, true);
  revalidatePath('/reports');
  return newAnalysis;
}
