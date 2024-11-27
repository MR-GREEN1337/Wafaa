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

    // Get consolidated analysis
    const consolidatedAnalysis = await tx.consolidatedAnalysis.findFirst({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average sentiment from recent analyses
    const recentSentiments = recentAnalyses
      .map(analysis => (analysis.content as { sentimentScore?: number })?.sentimentScore)
      .filter((score): score is number => typeof score === 'number');

    // Extract historical sentiment from consolidated analysis
    const historicalSentiment = consolidatedAnalysis?.analysis as { averageSentiment?: number } | null;
    const historicalScore = typeof historicalSentiment?.averageSentiment === 'number' 
      ? historicalSentiment.averageSentiment 
      : null;

    // Calculate weighted average sentiment
    let averageSentiment = 0;
    if (recentSentiments.length > 0 || historicalScore !== null) {
      const recentWeight = 0.7; // Give more weight to recent analyses
      const historicalWeight = 0.3;

      const recentAverage = recentSentiments.length > 0
        ? recentSentiments.reduce((acc, score) => acc + score, 0) / recentSentiments.length
        : 0;

      if (historicalScore !== null) {
        // If we have both recent and historical data
        averageSentiment = (recentSentiments.length > 0)
          ? (recentAverage * recentWeight) + (historicalScore * historicalWeight)
          : historicalScore; // Use only historical if no recent data
      } else {
        // If we only have recent data
        averageSentiment = recentAverage;
      }
    }

    return {
      activeRelationships,
      totalSessions,
      completionRate: totalSessions ? (completedSessions / totalSessions) * 100 : 0,
      averageSentiment: Math.round(averageSentiment * 100) / 100,
      recentAnalyses,
      lastUpdated: recentAnalyses[0]?.createdAt ?? new Date(),
      historicalDataAvailable: historicalScore !== null
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
        //status: 'completed' // Only analyze completed sessions
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

  return await prisma.$transaction(async (tx) => {
    // Get recent analyses
    const recentAnalyses = await tx.analysis.findMany({
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

    // Get historical consolidated analyses
    const consolidatedAnalyses = await tx.consolidatedAnalysis.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        createdAt: true,
        analysis: true
      }
    });

    // Get all relationship names for the user
    const relationships = await tx.relationship.findMany({
      where: {
        OR: [
          { partner1Id: userId },
          { partner2Id: userId }
        ]
      },
      select: {
        id: true,
        name: true
      }
    });

    // Create a map for quick relationship name lookup
    const relationshipMap = new Map(relationships.map(r => [r.id, r.name]));

    // Process consolidated analyses
    const consolidatedDataPoints = consolidatedAnalyses.map(ca => {
      const analysisContent = ca.analysis as {
        relationshipMetrics?: {
          [key: string]: {
            sentiment?: number;
            engagement?: number;
            progress?: number;
          }
        }
      };

      // If the consolidated analysis contains per-relationship metrics
      const relationshipMetrics = analysisContent.relationshipMetrics || {};
      
      return Object.entries(relationshipMetrics).map(([relationshipId, metrics]) => ({
        date: ca.createdAt.toISOString().split('T')[0],
        relationshipName: relationshipMap.get(relationshipId) || 'Unknown',
        sentiment: metrics.sentiment || 0,
        engagement: metrics.engagement || 0,
        progress: metrics.progress || 0,
        isHistorical: true
      }));
    }).flat();

    // Process recent analyses
    const recentDataPoints = recentAnalyses.map(analysis => ({
      date: analysis.createdAt.toISOString().split('T')[0],
      relationshipName: analysis.relationship.name,
      sentiment: (analysis.content as any).sentimentScore || 0,
      engagement: (analysis.content as any).engagementScore || 0,
      progress: (analysis.content as any).progressScore || 0,
      isHistorical: false
    }));

    // Combine and sort all data points
    const allDataPoints = [...consolidatedDataPoints, ...recentDataPoints]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate moving averages and aggregate metrics
    const processedData = allDataPoints.reduce((acc, curr) => {
      const existing = acc.find(
        item => item.date === curr.date && 
        item.relationshipName === curr.relationshipName
      );

      if (existing) {
        // If we have both historical and recent data for the same date,
        // use weighted average favoring recent data
        const weight = curr.isHistorical ? 0.3 : 0.7;
        const complementWeight = curr.isHistorical ? 0.7 : 0.3;

        existing.sentiment = (existing.sentiment * complementWeight + curr.sentiment * weight);
        existing.engagement = (existing.engagement * complementWeight + curr.engagement * weight);
        existing.progress = (existing.progress * complementWeight + curr.progress * weight);
      } else {
        acc.push({
          date: curr.date,
          relationshipName: curr.relationshipName,
          sentiment: curr.sentiment,
          engagement: curr.engagement,
          progress: curr.progress,
          // Calculate 7-day moving averages
          movingAvgSentiment: calculateMovingAverage(allDataPoints, curr.date, curr.relationshipName, 'sentiment', 7),
          movingAvgEngagement: calculateMovingAverage(allDataPoints, curr.date, curr.relationshipName, 'engagement', 7),
          movingAvgProgress: calculateMovingAverage(allDataPoints, curr.date, curr.relationshipName, 'progress', 7)
        });
      }

      return acc;
    }, [] as Array<{
      date: string;
      relationshipName: string;
      sentiment: number;
      engagement: number;
      progress: number;
      movingAvgSentiment: number;
      movingAvgEngagement: number;
      movingAvgProgress: number;
    }>);

    // Add overall relationship health score
    const finalData = processedData.map(dataPoint => ({
      ...dataPoint,
      overallScore: calculateOverallScore(dataPoint)
    }));

    return finalData;
  });
}

// Helper function to calculate moving averages
function calculateMovingAverage(
  data: Array<{
    date: string;
    relationshipName: string;
    sentiment: number;
    engagement: number;
    progress: number;
  }>,
  currentDate: string,
  relationshipName: string,
  metric: 'sentiment' | 'engagement' | 'progress',
  days: number
): number {
  const currentDateObj = new Date(currentDate);
  const startDate = new Date(currentDateObj);
  startDate.setDate(startDate.getDate() - days);

  const relevantData = data.filter(d => {
    const date = new Date(d.date);
    return date >= startDate && 
           date <= currentDateObj && 
           d.relationshipName === relationshipName;
  });

  if (relevantData.length === 0) return 0;

  const sum = relevantData.reduce((acc, curr) => acc + curr[metric], 0);
  return sum / relevantData.length;
}

// Helper function to calculate overall relationship health score
function calculateOverallScore(dataPoint: {
  sentiment: number;
  engagement: number;
  progress: number;
}): number {
  // Weighted average of all metrics
  const weights = {
    sentiment: 0.4,
    engagement: 0.3,
    progress: 0.3
  };

  return Math.round(
    (dataPoint.sentiment * weights.sentiment +
    dataPoint.engagement * weights.engagement +
    dataPoint.progress * weights.progress) * 100
  ) / 100;
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