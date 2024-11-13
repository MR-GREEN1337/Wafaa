"use server"

import Groq from 'groq-sdk';
import { Message, Analysis } from '@prisma/client';
import prisma from '@/lib/prisma';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function analyzeRelationshipMessages(messages: Message[]) {
  const prompt = `You are a relationship analysis expert. Analyze the following conversation messages between partners and provide a structured analysis. Focus on:

1. Overall sentiment (score between 0-1)
2. Key communication patterns
3. Main topics discussed
4. Relationship dynamics
5. Specific recommendations for improvement

Messages to analyze:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide the analysis in the following JSON format:
{
  "sentiment": 0.85,
  "patterns": [
    {
      "pattern": "Active Listening",
      "frequency": "high",
      "impact": "positive",
      "sentiment": 0.75

    }
  ],
  "topics": ["communication", "future plans"],
  "dynamics": {
    "strengths": [],
    "areas_for_improvement": []
  },
  "recommendations": [],
  "weekly_sentiment": [
    {
      "week": 1,
      "sentiment": 0.82
    }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a relationship analysis expert focused on providing actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 2048,
      top_p: 0.9
    });

    const analysisContent = completion.choices[0]?.message?.content;
    if (!analysisContent) {
      throw new Error('No analysis content received from Groq');
    }

    return JSON.parse(analysisContent);
  } catch (e) {
    console.error('Failed to analyze relationship messages:', e);
    throw new Error('Failed to analyze relationship messages');
  }
}

export async function generateAnalysis(relationshipId: string) {
  try {
    // Verify relationship exists first
    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId }
    });

    if (!relationship) {
      throw new Error(`Relationship with ID ${relationshipId} not found`);
    }

    // Get all messages generated for the relationship
    const messages = await prisma.message.findMany({
      where: { 
        session: {
          relationshipId: relationshipId
        }
      },
      orderBy: { createdAt: 'asc' },
      include: {
        session: true
      }
    });

    if (messages.length === 0) {
      // Return a default analysis if no messages exist
      const defaultAnalysis = {
        sentiment: 0,
        patterns: [],
        topics: [],
        dynamics: {
          strengths: [],
          areas_for_improvement: []
        },
        recommendations: ["Start having regular conversations to build analysis data"],
        weekly_sentiment: []
      };

      return prisma.analysis.create({
        data: {
          relationshipId,
          type: 'comprehensive',
          content: defaultAnalysis
        }
      });
    }

    // Group messages by week for temporal analysis
    const messagesByWeek = messages.reduce((acc, message) => {
      const week = Math.floor((new Date(message.createdAt).getTime() - 
        new Date(messages[0].createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (!acc[week]) acc[week] = [];
      acc[week].push(message);
      return acc;
    }, {} as Record<number, Message[]>);

    // Analyze each week's messages
    const weeklyAnalyses = await Promise.all(
      Object.entries(messagesByWeek).map(async ([week, weekMessages]) => {
        const analysis = await analyzeRelationshipMessages(weekMessages);
        return {
          week: parseInt(week),
          ...analysis
        };
      })
    );

    // Aggregate analyses for overall insights
    const overallAnalysis = {
      sentiment: weeklyAnalyses.reduce((acc, w) => acc + w.sentiment, 0) / weeklyAnalyses.length,
      patterns: weeklyAnalyses.flatMap(w => w.patterns)
        .reduce((acc, pattern) => {
          const existing = acc.find((p: { pattern: any; }) => p.pattern === pattern.pattern);
          if (existing) {
            existing.frequency = existing.frequency === 'high' || pattern.frequency === 'high' 
              ? 'high' : 'medium';
          } else {
            acc.push(pattern);
          }
          return acc;
        }, [] as any[]),
      topics: [...new Set(weeklyAnalyses.flatMap(w => w.topics))],
      dynamics: {
        strengths: [...new Set(weeklyAnalyses.flatMap(w => w.dynamics.strengths))],
        areas_for_improvement: [...new Set(weeklyAnalyses.flatMap(w => w.dynamics.areas_for_improvement))]
      },
      recommendations: weeklyAnalyses[weeklyAnalyses.length - 1]?.recommendations || [],
      weekly_sentiment: weeklyAnalyses.map(w => ({
        week: w.week + 1,
        sentiment: w.sentiment
      }))
    };

    return prisma.analysis.create({
      data: {
        relationshipId,
        type: 'comprehensive',
        content: overallAnalysis
      }
    });
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw error;
  }
}

export async function checkAnalysisNeedsUpdate(relationshipId: string): Promise<boolean> {
  try {
    // Get the most recent analysis
    const analysis = await prisma.analysis.findFirst({
      where: { 
        relationshipId,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // If no analysis exists, we need to generate one
    if (!analysis) return true;

    // Find the most recent message for this relationship
    const mostRecentMessage = await prisma.message.findFirst({
      where: {
        session: {
          relationshipId: relationshipId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If there are no messages, no update needed
    if (!mostRecentMessage) return false;

    // Compare the most recent message timestamp with the analysis update time
    return mostRecentMessage.createdAt > analysis.updatedAt;
  } catch (error) {
    console.error('Error checking analysis update status:', error);
    throw error; // Better to throw than assume update is needed
  }
}

export async function getOrGenerateAnalysis(relationshipId: string): Promise<Analysis> {
  try {
    // First check if relationship exists
    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId }
    });

    if (!relationship) {
      throw new Error(`Relationship with ID ${relationshipId} not found`);
    }

    // Try to find latest analysis
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        relationshipId,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const needsUpdate = await checkAnalysisNeedsUpdate(relationshipId);
    
    if (!existingAnalysis || needsUpdate) {
      // Delete all previous analyses for this relationship
      if (existingAnalysis) {
        await prisma.analysis.deleteMany({
          where: {
            relationshipId,
          }
        });
      }
      
      // Generate new analysis
      return generateAnalysis(relationshipId);
    }

    return existingAnalysis;
  } catch (error) {
    console.error('Error in getOrGenerateAnalysis:', error);
    throw error;
  }
}