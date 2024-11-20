import { z } from 'zod';

// Types for message metadata
interface MessageMetadata {
  topics: string[];
  sentiment: number;
  engagementScore: number;
  progressScore: number;
}

// Topic detection configuration
const TOPIC_KEYWORDS = {
  communication: ['talk', 'speak', 'listen', 'express', 'communicate', 'conversation', 'discuss'],
  emotions: ['feel', 'emotion', 'angry', 'happy', 'sad', 'frustrated', 'joy', 'love'],
  trust: ['trust', 'honest', 'faithful', 'reliable', 'dependable', 'loyalty'],
  intimacy: ['close', 'intimate', 'connect', 'bond', 'affection', 'touching', 'physical'],
  conflicts: ['fight', 'argue', 'disagree', 'conflict', 'problem', 'issue', 'resolve'],
  goals: ['future', 'plan', 'goal', 'dream', 'achieve', 'aspire', 'growth'],
  boundaries: ['boundary', 'limit', 'space', 'respect', 'privacy', 'comfort'],
  support: ['help', 'support', 'care', 'assist', 'encourage', 'understand'],
  activities: ['together', 'activity', 'spend time', 'share', 'enjoy', 'participate'],
  values: ['value', 'belief', 'important', 'priority', 'principle', 'moral']
};

// Sentiment indicators
const SENTIMENT_INDICATORS = {
  positive: [
    'happy', 'love', 'great', 'wonderful', 'excellent', 'good', 'better',
    'improve', 'appreciate', 'thank', 'grateful', 'excited', 'proud'
  ],
  negative: [
    'angry', 'sad', 'frustrated', 'upset', 'terrible', 'bad', 'worse',
    'hate', 'disappoint', 'hurt', 'annoyed', 'worried', 'concerned'
  ]
};

// Engagement indicators
const ENGAGEMENT_INDICATORS = [
  'think', 'believe', 'feel', 'understand', 'want', 'need',
  'share', 'explain', 'discuss', 'explore', 'consider', 'reflect'
];

/**
 * Generates metadata for a chat message
 * @param message The message content
 * @param context The relationship or self-session context
 * @returns MessageMetadata object
 */
export function generateMessageMetadata(
  message: string,
  context: any
): MessageMetadata {
  const normalizedMessage = message.toLowerCase();
  
  return {
    topics: detectTopics(normalizedMessage),
    sentiment: calculateSentiment(normalizedMessage),
    engagementScore: calculateEngagement(normalizedMessage),
    progressScore: calculateProgress(normalizedMessage, context)
  };
}

/**
 * Detects topics present in the message
 */
function detectTopics(message: string): string[] {
  const detectedTopics = new Set<string>();

  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => message.includes(keyword))) {
      detectedTopics.add(topic);
    }
  });

  return Array.from(detectedTopics);
}

/**
 * Calculates sentiment score (-1 to 1)
 */
function calculateSentiment(message: string): number {
  let score = 0;
  const words = message.split(/\s+/);

  const positiveCount = words.filter(word => 
    SENTIMENT_INDICATORS.positive.some(indicator => word.includes(indicator))
  ).length;

  const negativeCount = words.filter(word =>
    SENTIMENT_INDICATORS.negative.some(indicator => word.includes(indicator))
  ).length;

  const totalIndicators = positiveCount + negativeCount;
  if (totalIndicators > 0) {
    score = (positiveCount - negativeCount) / totalIndicators;
  }

  return Math.max(-1, Math.min(1, score)); // Clamp between -1 and 1
}

/**
 * Calculates engagement score (0 to 1)
 */
function calculateEngagement(message: string): number {
  const words = message.split(/\s+/);
  const engagementCount = words.filter(word =>
    ENGAGEMENT_INDICATORS.some(indicator => word.includes(indicator))
  ).length;

  return Math.min(1, engagementCount / Math.max(words.length / 10, 1));
}

/**
 * Calculates progress score based on message content and context
 */
function calculateProgress(message: string, context: any): number {
  let score = 0;
  const words = message.split(/\s+/);

  // Check for progress indicators
  const progressIndicators = [
    'better', 'improve', 'progress', 'understand', 'learn',
    'realize', 'change', 'growth', 'forward', 'solution'
  ];

  const progressCount = words.filter(word =>
    progressIndicators.some(indicator => word.includes(indicator))
  ).length;

  // Base score on progress indicators
  score += progressCount * 0.2;

  // Check for addressing identified growth areas
  if (context.growthAreas) {
    const addressingGrowthAreas = context.growthAreas.some((area: string) =>
      message.toLowerCase().includes(area.toLowerCase())
    );
    if (addressingGrowthAreas) {
      score += 0.3;
    }
  }

  return Math.min(1, score); // Clamp between 0 and 1
}

// Validation schema for metadata
export const metadataSchema = z.object({
  topics: z.array(z.string()),
  sentiment: z.number().min(-1).max(1),
  engagementScore: z.number().min(0).max(1),
  progressScore: z.number().min(0).max(1)
});