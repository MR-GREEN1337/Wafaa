"use server"

import { Message } from '@prisma/client';
import Groq from 'groq-sdk';
import { groupBy } from 'lodash';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface MessageWithMetadata extends Message {
  session: {
    relationship: {
      partner1Id: string;
      partner2Id: string;
    };
  };
}

interface PeriodAnalysis {
  sentiment: number;
  patterns: Array<{
    pattern: string;
    frequency: string;
    impact: 'negative' | 'neutral' | 'positive';
    sentiment: number;
  }>;
  topics: string[];
  dynamics: {
    strengths: string[];
    areas_for_improvement: string[];
  };
  recommendations: string[];
}

export interface PartnerPerceptions {
  perceptions: Array<{
    quality: string;
    confidence: number;
    evidence: string[];
    context: string;
  }>;
  overallImpression: string;
  communicationStyle: string;
  emotionalResponse: string;
  trustLevel: number;
  areas: {
    appreciation: string[];
    concern: string[];
  };
}


export interface ConsolidatedAnalysis {
  overallSentiment: number;
  totalInteractions: number;
  uniquePartners: number;
  commonPatterns: Array<{
    pattern: string;
    frequency: number;
    impact: 'negative' | 'neutral' | 'positive';
  }>;
  topTopics: Array<{
    topic: string;
    frequency: number;
  }>;
  sentimentTrend: Array<{
    period: string;
    sentiment: number;
  }>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  partnerPerceptions: {
    perPartner: Record<string, PartnerPerceptions>;
    summary: {
      commonQualities: string[];
      averageTrust: number;
      generalImpression: string;
    };
  };
}

// Helper function to group messages by time period (weeks)
function groupMessagesByPeriod(messages: MessageWithMetadata[]): Record<string, MessageWithMetadata[]> {
  if (messages.length === 0) return {};

  const firstMessageDate = new Date(messages[0].createdAt);
  
  return groupBy(messages, (message) => {
    const messageDate = new Date(message.createdAt);
    const weekDiff = Math.floor(
      (messageDate.getTime() - firstMessageDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    return `Week ${weekDiff + 1}`;
  });
}

export async function analyzePartnerPerceptions(messages: MessageWithMetadata[], userId: string): Promise<PartnerPerceptions> {
  const prompt = `Analyze the following conversation messages to determine how the partner perceives the user. Focus on their emotional responses, communication patterns, and expressed views.

Messages to analyze:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide the analysis in the following JSON format, return only JSON:
{
  "perceptions": [
    {
      "quality": "Supportive listener",
      "confidence": 0.85,
      "evidence": ["Shows consistent empathy", "Asks follow-up questions"],
      "context": "Emotional discussions"
    }
  ],
  "overallImpression": "Caring and attentive partner",
  "communicationStyle": "Direct but gentle",
  "emotionalResponse": "Generally positive and validating",
  "trustLevel": 0.9,
  "areas": {
    "appreciation": ["Emotional availability", "Patience"],
    "concern": ["Work-life balance", "Stress management"]
  }
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a relationship analysis expert focused on understanding partner perceptions and dynamics.'
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
  } catch (error) {
    console.error('Failed to analyze partner perceptions:', error);
    throw error;
  }
}

// Analyze messages for a single period using Groq
async function analyzeMessagePeriod(messages: MessageWithMetadata[]): Promise<PeriodAnalysis> {
  const prompt = `You are a relationship analysis expert. Analyze the following conversation messages and provide a structured analysis. Focus on sentiment, patterns, topics, and relationship dynamics.

Messages to analyze:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide the analysis in the following JSON format, return only json, nothing more, pure JSON JSON:
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
    "strengths": ["openness", "mutual respect"],
    "areas_for_improvement": ["conflict resolution"]
  },
  "recommendations": ["Practice active listening", "Schedule regular check-ins"]
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
  } catch (error) {
    console.error('Failed to analyze period messages:', error);
    throw error;
  }
}

// Calculate frequency of patterns across all periods
function aggregatePatterns(periodAnalyses: PeriodAnalysis[]): ConsolidatedAnalysis['commonPatterns'] {
  const patternMap = new Map<string, { count: number; impact: 'negative' | 'neutral' | 'positive'; totalSentiment: number }>();

  // Count pattern occurrences and aggregate their impact
  periodAnalyses.forEach(analysis => {
    analysis.patterns.forEach(pattern => {
      const existing = patternMap.get(pattern.pattern) || { count: 0, impact: pattern.impact, totalSentiment: 0 };
      patternMap.set(pattern.pattern, {
        count: existing.count + 1,
        impact: pattern.impact,
        totalSentiment: existing.totalSentiment + pattern.sentiment
      });
    });
  });

  // Convert to frequency percentage and sort by frequency
  const totalPeriods = periodAnalyses.length;
  return Array.from(patternMap.entries())
    .map(([pattern, data]) => ({
      pattern,
      frequency: Math.round((data.count / totalPeriods) * 100),
      impact: data.impact
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // Keep top 5 patterns
}

// Aggregate topics across all periods
function aggregateTopics(periodAnalyses: PeriodAnalysis[]): ConsolidatedAnalysis['topTopics'] {
  const topicMap = new Map<string, number>();

  // Count topic occurrences
  periodAnalyses.forEach(analysis => {
    analysis.topics.forEach(topic => {
      topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
    });
  });

  // Convert to frequency percentage and sort
  const totalPeriods = periodAnalyses.length;
  return Array.from(topicMap.entries())
    .map(([topic, count]) => ({
      topic,
      frequency: Math.round((count / totalPeriods) * 100)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // Keep top 5 topics
}

// Aggregate strengths across all periods
function aggregateStrengths(periodAnalyses: PeriodAnalysis[]): string[] {
  const strengthSet = new Set<string>();
  periodAnalyses.forEach(analysis => {
    analysis.dynamics.strengths.forEach(strength => strengthSet.add(strength));
  });
  return Array.from(strengthSet).slice(0, 5); // Keep top 5 strengths
}

// Aggregate areas for improvement
function aggregateImprovements(periodAnalyses: PeriodAnalysis[]): string[] {
  const improvementSet = new Set<string>();
  periodAnalyses.forEach(analysis => {
    analysis.dynamics.areas_for_improvement.forEach(improvement => improvementSet.add(improvement));
  });
  return Array.from(improvementSet).slice(0, 5); // Keep top 5 improvements
}

// Generate consolidated recommendations
function generateOverallRecommendations(periodAnalyses: PeriodAnalysis[]): string[] {
  // Prioritize recent recommendations but include persistent issues
  const recentAnalyses = periodAnalyses.slice(-3); // Last 3 periods
  const recommendationFrequency = new Map<string, number>();

  recentAnalyses.forEach(analysis => {
    analysis.recommendations.forEach(rec => {
      recommendationFrequency.set(rec, (recommendationFrequency.get(rec) || 0) + 1);
    });
  });

  return Array.from(recommendationFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([rec]) => rec)
    .slice(0, 5); // Keep top 5 recommendations
}

// Calculate sentiment trend
function calculateSentimentTrend(periodAnalyses: PeriodAnalysis[]): ConsolidatedAnalysis['sentimentTrend'] {
  return periodAnalyses.map((analysis, index) => ({
    period: `Week ${index + 1}`,
    sentiment: Math.round(analysis.sentiment * 100)
  }));
}

// Main function to generate consolidated analysis
export async function generateConsolidatedAnalysis(messages: MessageWithMetadata[], userId: string): Promise<ConsolidatedAnalysis> {
  try {
    // Get unique partners
    const uniquePartners = new Set(
      messages.map(m => 
        m.session.relationship.partner1Id === userId 
          ? m.session.relationship.partner2Id 
          : m.session.relationship.partner1Id
      )
    );

    // Group messages by period
    const periodMessages = groupMessagesByPeriod(messages);

    // Analyze each period
    const periodAnalyses = await Promise.all(
      Object.entries(periodMessages)
        .sort(([periodA], [periodB]) => periodA.localeCompare(periodB))
        .map(async ([_, msgs]) => analyzeMessagePeriod(msgs))
    );

    // Calculate overall sentiment
    const overallSentiment = periodAnalyses.reduce(
      (acc, analysis) => acc + analysis.sentiment, 
      0
    ) / periodAnalyses.length;

    // Generate consolidated analysis
    const consolidatedAnalysisBefore: any = {
      overallSentiment: Math.round(overallSentiment * 100),
      totalInteractions: messages.length,
      uniquePartners: uniquePartners.size,
      commonPatterns: aggregatePatterns(periodAnalyses),
      topTopics: aggregateTopics(periodAnalyses),
      sentimentTrend: calculateSentimentTrend(periodAnalyses),
      strengths: aggregateStrengths(periodAnalyses),
      improvements: aggregateImprovements(periodAnalyses),
      recommendations: generateOverallRecommendations(periodAnalyses)
    };

    const messagesByPartner = groupBy(messages, m => 
      m.session.relationship.partner1Id === userId 
        ? m.session.relationship.partner2Id 
        : m.session.relationship.partner1Id
    );
  
    // Analyze perceptions for each partner
    const perPartner: Record<string, PartnerPerceptions> = {};
    for (const [partnerId, partnerMessages] of Object.entries(messagesByPartner)) {
      perPartner[partnerId] = await analyzePartnerPerceptions(partnerMessages, userId);
    }
  
    // Calculate summary statistics
    const allPerceptions = Object.values(perPartner).flatMap(p => p.perceptions.map(x => x.quality));
    const commonQualities = [...new Set(allPerceptions)]
      .map(quality => ({
        quality,
        count: allPerceptions.filter(q => q === quality).length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(x => x.quality);
  
    const averageTrust = Object.values(perPartner)
      .reduce((acc, p) => acc + p.trustLevel, 0) / Object.values(perPartner).length;
  
    return {
      ...consolidatedAnalysisBefore,
      partnerPerceptions: {
        perPartner,
        summary: {
          commonQualities,
          averageTrust,
          generalImpression: await generateGeneralImpression(perPartner)
        }
      }
    };

  } catch (error) {
    console.error('Error generating consolidated analysis:', error);
    throw error;
  }
}

// Helper function to generate general impression from partner perceptions
async function generateGeneralImpression(perPartner: Record<string, PartnerPerceptions>): Promise<string> {
  const prompt = `Analyze the following partner perceptions data and generate a concise general impression summary of how partners perceive the user. The summary should be balanced, highlighting both strengths and areas for growth.
  
  Partner Perceptions Data:
  ${JSON.stringify(perPartner, null, 2)}
  
  Provide the analysis in the following JSON format, return only JSON:
  {
    "generalImpression": "string describing overall impression across all partners"
    }`;
    
    try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a relationship analysis expert focused on synthesizing partner perceptions into meaningful insights. Be balanced, constructive, and focus on patterns across multiple partners.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.9
    });
    
    const analysisContent = completion.choices[0]?.message?.content;
    if (!analysisContent) {
      throw new Error('No analysis content received from Groq');
    }
    
    const result = JSON.parse(analysisContent);
    return result.generalImpression;
  } catch (error) {
    console.error('Failed to generate general impression:', error);
    throw error;
  }
}

// Updated generateDefaultAnalysis with partnerPerceptions
// Helper function to generate default analysis when no messages exist
export async function generateDefaultAnalysis(): Promise<ConsolidatedAnalysis> {
  return {
    overallSentiment: 0,
    totalInteractions: 0,
    uniquePartners: 0,
    commonPatterns: [],
    topTopics: [],
    sentimentTrend: [],
    strengths: [],
    improvements: [],
    recommendations: [
      "Start having regular conversations to build analysis data",
      "Set up initial relationship check-ins",
      "Begin tracking communication patterns",
      "Document key relationship milestones",
      "Schedule regular relationship reviews"
    ],
    partnerPerceptions: {
      perPartner: {},
      summary: {
        commonQualities: [],
        averageTrust: 0,
        generalImpression: "No interaction data available yet to form impressions. Begin engaging with partners to build a perception profile."
      }
    }
  };
}