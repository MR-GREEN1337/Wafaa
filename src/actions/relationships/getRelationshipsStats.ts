"use server"

import prisma from "@/lib/prisma";

export async function getRelationshipStats(userId: string) {
    const stats = await prisma.$transaction(async (tx) => {
      // Get active relationships count
      const activeRelationships = await tx.relationship.count({
        where: {
          OR: [
            { partner1Id: userId },
            { partner2Id: userId }
          ],
          status: 'active'
        }
      });
  
      // Get total sessions across all relationships
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
  
      // Get session completion rate
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
  
      // Calculate success metrics from analyses
      const recentAnalyses = await tx.analysis.findMany({
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
        take: 10,
        select: {
          content: true
        }
      });
  
      // Calculate average sentiment score from recent analyses
      const avgSentiment = recentAnalyses.reduce((acc, analysis) => {
        const content = analysis.content as any;
        return acc + (content.sentimentScore || 0);
      }, 0) / (recentAnalyses.length || 1);
  
      return {
        activeRelationships,
        totalSessions,
        completionRate: totalSessions ? (completedSessions / totalSessions) * 100 : 0,
        averageSentiment: Math.round(avgSentiment * 100) / 100,
        recentAnalyses
      };
    });
  
    return stats;
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
  
  export async function getTrendingTopics(userId: string) {
    const recentMessages = await prisma.message.findMany({
      where: {
        session: {
          relationship: {
            OR: [
              { partner1Id: userId },
              { partner2Id: userId }
            ]
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100,
      select: {
        metadata: true
      }
    });
  
    // Aggregate topics from message metadata
    const topicFrequency = new Map<string, number>();
    recentMessages.forEach(message => {
      const metadata = message.metadata as any;
      if (metadata?.topics) {
        metadata.topics.forEach((topic: string) => {
          topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + 1);
        });
      }
    });
  
    // Sort and return top topics
    return Array.from(topicFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, frequency]) => ({
        topic,
        frequency,
        sentiment: calculateTopicSentiment(topic, recentMessages)
      }));
  }
  
export async function calculateTopicSentiment(topic: string, messages: any[]) {
    let totalSentiment = 0;
    let count = 0;
  
    messages.forEach(message => {
      const metadata = message.metadata as any;
      if (metadata?.topics?.includes(topic) && metadata?.sentiment) {
        totalSentiment += metadata.sentiment;
        count++;
      }
    });
  
    return count ? totalSentiment / count : 0;
  }
  