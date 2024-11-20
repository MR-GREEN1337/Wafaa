import { auth } from '@clerk/nextjs/server';
import { Lightbulb, Users } from 'lucide-react'
import React from 'react'
import Advice from './_components/Advice';
import prisma from '@/lib/prisma';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ConsolidatedAnalysis, generateConsolidatedAnalysis, generateDefaultAnalysis } from '@/actions/reports/consolidatedReport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ANALYSIS_CACHE_TIME = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

async function getOrGenerateAnalysis(userId: string) {
  // Previous implementation remains the same
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
    console.log("Using existing analysis", existingAnalysis.analysis)
    return existingAnalysis.analysis;
  }

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

  await prisma.consolidatedAnalysis.create({
    data: {
      userId,
      analysis: JSON.stringify(finalAnalysis)
    }
  });

  return finalAnalysis;
}

function PerceptionCard({ perception, index }: { 
  perception: { 
    quality: string; 
    confidence: number; 
    evidence: string[]; 
    context: string; 
  }; 
  index: number 
}) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{perception.quality}</CardTitle>
        <CardDescription>{perception.context}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="text-sm font-medium">{Math.round(perception.confidence * 100)}%</span>
          </div>
          <Progress value={perception.confidence * 100} className="h-2" />
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Supporting Evidence:</h4>
          <ul className="list-disc pl-4 text-sm text-muted-foreground">
            {perception.evidence.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function PartnerPerceptions({ analysis }: { analysis: any }) {
  // Early return if no partner perceptions exist
  if (!analysis?.partnerPerceptions) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Perception Data</AlertTitle>
        <AlertDescription>
          Start interacting with partners to build perception data.
        </AlertDescription>
      </Alert>
    );
  }

  // Provide default values to prevent undefined errors
  const summary = analysis.partnerPerceptions.summary ?? {
    generalImpression: "No specific insights available yet.",
    commonQualities: [],
    averageTrust: 0
  };

  const perPartner = analysis.partnerPerceptions.perPartner ?? {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Impression</CardTitle>
          <CardDescription>
            Based on {Object.keys(perPartner).length} partner(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {summary.generalImpression || "No general impression available."}
          </p>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Common Qualities:</h4>
            <div className="flex flex-wrap gap-2">
              {(summary.commonQualities || []).length > 0 ? (
                (summary.commonQualities || []).map((quality: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {quality}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No common qualities identified.</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Average Trust Level</span>
              <span className="text-sm font-medium">
                {Math.round((summary.averageTrust ?? 0) * 100)}%
              </span>
            </div>
            <Progress 
              value={Math.round((summary.averageTrust ?? 0) * 100)} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Perceptions</h3>
        {Object.keys(perPartner).length > 0 ? (
          Object.values(perPartner).map((partner: any, partnerIndex: number) => (
            <div key={partnerIndex} className="mb-6">
              <h4 className="text-md font-medium mb-3">Partner {partnerIndex + 1}</h4>
              {partner.perceptions && partner.perceptions.length > 0 ? (
                partner.perceptions.map((perception: any, index: number) => (
                  <PerceptionCard key={index} perception={perception} index={index} />
                ))
              ) : (
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No perception data available for this partner.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))
        ) : (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Partner Data</AlertTitle>
            <AlertDescription>
              You haven't interacted with any partners yet.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
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
  return (
    <div className='flex-1 flex flex-col h-full'>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <div className='flex flex-row space-x-3'>
            <h1 className='text-3xl font-bold'>Insights & Advice</h1>
            <Lightbulb className='animate-pulse' size={40} />
          </div>
          <p className='text-muted-foreground'>Relationship insights and personalized advice</p>
        </div>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 py-10 px-5'>
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <Users className="h-6 w-6" />
            <h2 className='text-2xl font-semibold'>Partner Perceptions</h2>
          </div>
          <PartnerPerceptions analysis={analysis} />
        </div>
        
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <Lightbulb className="h-6 w-6" />
            <h2 className='text-2xl font-semibold'>Personalized Advice</h2>
          </div>
          <Advice analysis={analysis} />
        </div>
      </div>
    </div>
  )
}

export default Page