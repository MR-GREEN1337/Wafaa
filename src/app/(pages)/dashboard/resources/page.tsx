import { auth } from '@clerk/nextjs/server';
import { Lightbulb } from 'lucide-react'
import React from 'react'
import Advice from './_components/Advice';
import prisma from '@/lib/prisma';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { generateConsolidatedAnalysis, generateDefaultAnalysis } from '@/actions/reports/consolidatedReport';

const ANALYSIS_CACHE_TIME = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

async function getOrGenerateAnalysis(userId: string) {
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

  // If no valid cached analysis exists, generate a new one
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

  // Get unique partners
  const uniquePartners = new Set(
    messages.map(m => 
      m.session.relationship.partner1Id === userId 
        ? m.session.relationship.partner2Id 
        : m.session.relationship.partner1Id
    )
  );

  // Generate new analysis
  const analysis = messages.length > 0 
    ? await generateConsolidatedAnalysis(messages, userId)
    : await generateDefaultAnalysis();

  const finalAnalysis = {
    ...analysis,
    uniquePartners: uniquePartners.size,
    totalInteractions: messages.length
  };

  // Store the new analysis in the database
  await prisma.consolidatedAnalysis.create({
    data: {
      userId,
      analysis: finalAnalysis
    }
  });

  return finalAnalysis;
}

async function Page() {
  const {userId} = await auth();

    if (!userId) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to authenticate user. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }
  
    const analysis = await getOrGenerateAnalysis(userId);
    // Add button to refresh analysis
    
 return (
    <div className='flex-1 flex flex-col h-full'>
    <div className='flex justify-between'>
        <div className='flex flex-col'>
          <div className='flex flex-row space-x-3'>
            <h1 className='text-3xl font-bold'>Advice and Resources</h1>
            <Lightbulb className='animate-pulse' size={40} />
            </div>
            <p className='text-muted-foreground'>Consult Pieces of advice catered for you</p>
        </div>
    </div> 
    <div className='py-10 px-5'>
    <Advice analysis={analysis as any} />
    </div>
    </div> 
  )
} 

export default Page