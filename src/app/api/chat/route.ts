import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions.mjs';
import { auth } from '@clerk/nextjs/server';
import { prompt } from '@/lib/constants';
import { generateMessageMetadata } from '@/helpers/messageMetadata';

// Initialize Groq SDK with the API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_CONTEXT_TOKENS = 8192;
const APPROX_TOKENS_PER_CHAR = 0.25;
const MAX_CHARS = Math.floor(MAX_CONTEXT_TOKENS * 4);
const SYSTEM_PROMPT_CHARS = 1000;

interface UserTraits {
  personalityType: string | null;
  communicationStyle: string | null;
  loveLanguages: string[];
  coreValues: string[];
  conflictStyle: string | null;
  attachmentStyle: string | null;
  stressors: string[];
  interests: string[];
}

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();

    // Get session with both users' traits and relationship details
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: { 
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            personalityType: true,
            communicationStyle: true,
            loveLanguages: true,
            coreValues: true,
            conflictStyle: true,
            attachmentStyle: true,
            stressors: true,
            interests: true
          }
        },
        relationship: {
          include: {
            partner1: {
              select: {
                id: true,
                personalityType: true,
                communicationStyle: true,
                loveLanguages: true,
                coreValues: true,
                conflictStyle: true,
                attachmentStyle: true,
                stressors: true,
                interests: true
              }
            },
            partner2: {
              select: {
                id: true,
                personalityType: true,
                communicationStyle: true,
                loveLanguages: true,
                coreValues: true,
                conflictStyle: true,
                attachmentStyle: true,
                stressors: true,
                interests: true
              }
            }
          }
        }
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    
    // Determine if this is a self-session or a relationship session
    const isSelfSession = !session.relationship;
    let relationshipContext: string;
    
    if (isSelfSession) {
      relationshipContext = formatSelfSessionContext(session.user as UserTraits);
    } else {
      const currentUserId = session.user.id;
      const relationship = session.relationship;
      const isPartner1 = currentUserId === relationship.partner1.id;
      
      const currentUser = isPartner1 ? relationship.partner1 : relationship.partner2;
      const partner = isPartner1 ? relationship.partner2 : relationship.partner1;

      relationshipContext = formatRelationshipContext(
        currentUser as UserTraits,
        partner as UserTraits,
        relationship
      );
    }
    const metadata = generateMessageMetadata(message, relationshipContext);
    console.log(`Generated metadata for message ${message} is`, metadata)
    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        metadata: metadata as any, // Type assertion needed for Prisma
        sessionId,
      },
    });

    // Prepare messages with truncation if needed
    const formattedMessages = session.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
    formattedMessages.push({ role: 'user', content: message });

    // Truncate messages to fit context window
    const truncatedMessages = truncateMessages(formattedMessages, relationshipContext);
    
    // Get chat completion from Groq
    const chatCompletion = await getGroqChatCompletion(truncatedMessages, relationshipContext);

    const assistantMessage = chatCompletion.choices[0]?.message?.content || '';

    const assistantMetadata = generateMessageMetadata(assistantMessage, relationshipContext);
    console.log(`Generated metadata for message ${message} is`, metadata)
    // Save assistant message
    const savedAssistantMessage = await prisma.message.create({
      data: {
        content: assistantMessage,
        role: 'assistant',
        metadata: assistantMetadata as any, // Type assertion needed for Prisma,
        sessionId,
      },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage: savedAssistantMessage,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatSelfSessionContext(user: UserTraits): string {
  return `Self-Session Context:

User Profile:
- Personality Type: ${user.personalityType || 'Not specified'}
- Communication Style: ${user.communicationStyle || 'Not specified'}
- Love Languages: ${user.loveLanguages.join(', ') || 'Not specified'}
- Core Values: ${user.coreValues.join(', ') || 'Not specified'}
- Conflict Style: ${user.conflictStyle || 'Not specified'}
- Attachment Style: ${user.attachmentStyle || 'Not specified'}
- Key Stressors: ${user.stressors.join(', ') || 'Not specified'}
- Interests: ${user.interests.join(', ') || 'Not specified'}

Session Type: Self-reflection and personal growth focus`;
}

function formatRelationshipContext(
  currentUser: UserTraits,
  partner: UserTraits,
  relationship: any
): string {
  return `Relationship Context:
- Status: ${relationship.status}
- Created: ${relationship.createdAt}

Current User Profile:
- Personality Type: ${currentUser.personalityType || 'Not specified'}
- Communication Style: ${currentUser.communicationStyle || 'Not specified'}
- Love Languages: ${currentUser.loveLanguages.join(', ') || 'Not specified'}
- Core Values: ${currentUser.coreValues.join(', ') || 'Not specified'}
- Conflict Style: ${currentUser.conflictStyle || 'Not specified'}
- Attachment Style: ${currentUser.attachmentStyle || 'Not specified'}
- Key Stressors: ${currentUser.stressors.join(', ') || 'Not specified'}
- Interests: ${currentUser.interests.join(', ') || 'Not specified'}

Partner Profile:
- Personality Type: ${partner.personalityType || 'Not specified'}
- Communication Style: ${partner.communicationStyle || 'Not specified'}
- Love Languages: ${partner.loveLanguages.join(', ') || 'Not specified'}
- Core Values: ${partner.coreValues.join(', ') || 'Not specified'}
- Conflict Style: ${partner.conflictStyle || 'Not specified'}
- Attachment Style: ${partner.attachmentStyle || 'Not specified'}
- Key Stressors: ${partner.stressors.join(', ') || 'Not specified'}
- Interests: ${partner.interests.join(', ') || 'Not specified'}

Key Relationship Dynamics:
- Shared Values: ${findSharedValues(currentUser.coreValues, partner.coreValues)}
- Potential Growth Areas: ${identifyGrowthAreas(currentUser, partner)}
- Communication Compatibility: ${assessCommunicationCompatibility(currentUser, partner)}`;
}

// Helper functions remain unchanged
function findSharedValues(values1: string[], values2: string[]): string {
  const shared = values1.filter(value => values2.includes(value));
  return shared.length > 0 ? shared.join(', ') : 'None identified';
}

function identifyGrowthAreas(user1: UserTraits, user2: UserTraits): string {
  const areas: string[] = [];
  
  if (user1.communicationStyle !== user2.communicationStyle) {
    areas.push('Communication style alignment');
  }
  if (user1.conflictStyle !== user2.conflictStyle) {
    areas.push('Conflict resolution approach');
  }
  if (!hasCommonElements(user1.loveLanguages, user2.loveLanguages)) {
    areas.push('Love language understanding');
  }
  
  return areas.length > 0 ? areas.join(', ') : 'None identified';
}

function assessCommunicationCompatibility(user1: UserTraits, user2: UserTraits): string {
  if (!user1.communicationStyle || !user2.communicationStyle) return 'Insufficient data';
  
  const stylePairs: { [key: string]: string } = {
    'Direct-Direct': 'Strong - Both partners communicate clearly',
    'Direct-Passive': 'May need adjustment - Different communication preferences',
    'Passive-Passive': 'May need development - Both partners may avoid conflict'
  };
  
  const key = `${user1.communicationStyle}-${user2.communicationStyle}`;
  return stylePairs[key] || 'Needs assessment';
}

function hasCommonElements(arr1: string[], arr2: string[]): boolean {
  return arr1.some(item => arr2.includes(item));
}

function truncateMessages(
  messages: Array<{ role: string; content: string }>,
  relationshipContext: string
): Array<{ role: string; content: string }> {
  const contextChars = relationshipContext.length;
  let availableChars = MAX_CHARS - SYSTEM_PROMPT_CHARS - contextChars;
  
  const latestMessage = messages[messages.length - 1];
  availableChars -= latestMessage.content.length;
  
  const truncatedMessages: Array<{ role: string; content: string }> = [];
  
  for (let i = messages.length - 2; i >= 0; i--) {
    const message = messages[i];
    if (availableChars - message.content.length > 0) {
      truncatedMessages.unshift(message);
      availableChars -= message.content.length;
    } else {
      break;
    }
  }
  
  truncatedMessages.push(latestMessage);
  
  return truncatedMessages;
}

async function getGroqChatCompletion(
  messages: Array<{ role: string; content: string }>,
  relationshipContext: string
) {
  const systemPromptWithContext = `${prompt}\n\n${relationshipContext}`;
  
  const chatCompletionMessages = [
    { role: 'system', content: systemPromptWithContext },
    ...messages.map(message => ({
      role: message.role,
      content: message.content
    }))
  ];

  return groq.chat.completions.create({
    messages: chatCompletionMessages as ChatCompletionMessageParam[],
    model: 'llama3-8b-8192',
  });
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return new NextResponse('Session ID required', { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!session || session.status === 'COMPLETED') {
      return new NextResponse('Session not found or was COMPLETED', { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        sessionId,
        session: {
          userId: userId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Get Messages Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}