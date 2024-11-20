"use server"

import prisma from "@/lib/prisma";

interface MessageMetadata {
  topics?: string[];
  sentiment?: number;
  engagementScore?: number;
  progressScore?: number;
}

// Main function to update stats when messages change
export async function updateRelationshipStats(
  userId: string,
  sessionId: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the relationship ID from the session
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      select: { 
        relationshipId: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          select: { 
            content: true,
            metadata: true,
            createdAt: true 
          }
        }
      }
    });

    if (!session) return null;

    // 2. Calculate new stats from messages
    const messageStats = calculateMessageStats(session.messages);

    // 3. Create new analysis record
    const _ = await tx.analysis.create({
      data: {
        relationshipId: session.relationshipId,
        type: 'message_based',
        content: {
          sentimentScore: messageStats.averageSentiment,
          engagementScore: messageStats.engagementScore,
          progressScore: messageStats.progressScore,
          topics: messageStats.topics,
          messageCount: session.messages.length,
          lastActivityAt: session.messages[0]?.createdAt
        },
        sessions: {
          connect: { id: sessionId }
        }
      }
    });

    // 4. Return updated stats
    return await getRelationshipStats(userId);
  });
}

// Helper function to calculate stats from messages
function calculateMessageStats(messages: { content: string; metadata: any }[]) {
  let totalSentiment = 0;
  let totalEngagement = 0;
  let totalProgress = 0;
  let validScores = 0;
  const topics = new Set<string>();

  messages.forEach(message => {
    const metadata = message.metadata as MessageMetadata;
    
    if (metadata) {
      if (typeof metadata.sentiment === 'number') {
        totalSentiment += metadata.sentiment;
        validScores++;
      }
      
      if (typeof metadata.engagementScore === 'number') {
        totalEngagement += metadata.engagementScore;
      }
      
      if (typeof metadata.progressScore === 'number') {
        totalProgress += metadata.progressScore;
      }

      if (metadata.topics) {
        metadata.topics.forEach(topic => topics.add(topic));
      }
    }
  });
  console.log("Total Sentiment: ", totalSentiment);
  console.log("Valid Scores: ", validScores);
  console.log("Total Engagement: ", totalEngagement);
  console.log("Total Progress: ", totalProgress);
  console.log("Topics: ", topics);

  return {
    averageSentiment: validScores ? totalSentiment / validScores : 0,
    engagementScore: messages.length ? totalEngagement / messages.length : 0,
    progressScore: messages.length ? totalProgress / messages.length : 0,
    topics: Array.from(topics)
  };
}

// Modified getRelationshipStats to include latest analysis
export async function getRelationshipStats(userId: string) {
    const stats = await prisma.$transaction(async (tx) => {
      const activeRelationships = await tx.relationship.count({
        where: {
          OR: [
            { partner1Id: userId },
            { partner2Id: userId }
          ],
          status: 'ACTIVE'
        }
      });
  
      const totalSessions = await tx.session.count({
        where: {
          relationship: {
            OR: [
              { partner1Id: userId },
              { partner2Id: userId }
            ]
          }
        }
      });
  
      const completedSessions = await tx.session.count({
        where: {
          relationship: {
            OR: [
              { partner1Id: userId },
              { partner2Id: userId }
            ]
          },
          status: 'completed'
        }
      });
  
      // Get latest analysis for each relationship
      const recentAnalyses = await tx.analysis.findMany({
        where: {
          relationship: {
            OR: [
              { partner1Id: userId },
              { partner2Id: userId }
            ]
          },
          type: 'message_based'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        select: {
          content: true,
          createdAt: true,
          relationship: {
            select: {
              name: true
            }
          }
        }
      });

      const avgSentiment = recentAnalyses.reduce((acc, analysis) => {
        const content = analysis.content as { sentimentScore?: number };
        if (typeof content?.sentimentScore === 'number') {
          return acc + content.sentimentScore;
        }
        return acc;
      }, 0) / (recentAnalyses.filter(a => 
        typeof (a.content as { sentimentScore?: number })?.sentimentScore === 'number'
      ).length || 1);

      //console.log("avgSentiment", avgSentiment);

      return {
        activeRelationships,
        totalSessions,
        completionRate: totalSessions ? (completedSessions / totalSessions) * 100 : 0,
        averageSentiment: Math.round(avgSentiment * 100) / 100,
        recentAnalyses,
        lastUpdated: recentAnalyses[0]?.createdAt ?? new Date()
      };
    });
  
    return stats;
}

// Usage example:
// After updating messages in a session:
// await updateRelationshipStats(userId, sessionId);

export async function getTrendingTopics(userId: string) {
    // First, get all sessions for the user's relationships
    const sessions = await prisma.session.findMany({
      where: {
        relationship: {
          OR: [
            { partner1Id: userId },
            { partner2Id: userId }
          ]
        },
        status: 'completed' // Only analyze completed sessions
      },
      select: {
        id: true,
        messages: {
          select: {
            metadata: true,
            content: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      take: 20 // Limit to recent sessions for better performance
    });

    // Flatten messages from all sessions
    const recentMessages = sessions.flatMap(session => session.messages);

    // Initialize topic tracking with proper typing
    interface TopicData {
      frequency: number;
      sentimentTotal: number;
      sentimentCount: number;
    }
    
    const topicData = new Map<string, TopicData>();

    // Process each message
    recentMessages.forEach(message => {
      const metadata = message.metadata as { 
        topics?: string[], 
        sentiment?: number 
      } | null;

      //console.log("metadata for message", metadata)

      if (metadata?.topics) {
        metadata.topics.forEach(topic => {
          const currentData = topicData.get(topic) || {
            frequency: 0,
            sentimentTotal: 0,
            sentimentCount: 0
          };

          currentData.frequency += 1;
          
          if (typeof metadata.sentiment === 'number') {
            currentData.sentimentTotal += metadata.sentiment;
            currentData.sentimentCount += 1;
          }

          topicData.set(topic, currentData);
        });
      }
    });

    // Transform and sort topics
    const topics = Array.from(topicData.entries())
      .map(([topic, data]) => ({
        topic,
        frequency: data.frequency,
        sentiment: data.sentimentCount > 0 
          ? data.sentimentTotal / data.sentimentCount 
          : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return topics;
}

// Helper function to calculate topic sentiment
function calculateTopicSentiment(topic: string, messages: any[]) {
    let totalSentiment = 0;
    let count = 0;

    messages.forEach(message => {
      const metadata = message.metadata as { 
        topics?: string[], 
        sentiment?: number 
      } | null;

      if (metadata?.topics?.includes(topic) && 
          typeof metadata.sentiment === 'number') {
        totalSentiment += metadata.sentiment;
        count++;
      }
    });

    return count ? Math.round((totalSentiment / count) * 100) / 100 : 0;
}

  export async function getRelationshipProgress(userId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
    const analyses = await prisma.analysis.findMany({
      where: {
        relationship: {
          OR: [
            { partner1Id: userId },
            { partner2Id: userId }
          ]
        },
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        createdAt: true,
        content: true,
        relationship: {
          select: {
            name: true
          }
        }
      }
    });
  
    // Transform analyses into chart data
    return analyses.map(analysis => ({
      date: analysis.createdAt.toISOString().split('T')[0],
      relationshipName: analysis.relationship.name,
      sentiment: (analysis.content as any).sentimentScore || 0,
      engagement: (analysis.content as any).engagementScore || 0,
      progress: (analysis.content as any).progressScore || 0
    }));
  }
  
  export async function getLatestSessions(userId: string) {
    return await prisma.session.findMany({
      where: {
        relationship: {
          OR: [
            { partner1Id: userId },
            { partner2Id: userId }
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        sessionType: true,
        status: true,
        createdAt: true,
        relationship: {
          select: {
            name: true
          }
        },
        messages: {
          select: {
            content: true,
            metadata: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
  }