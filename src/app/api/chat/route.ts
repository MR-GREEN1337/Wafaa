import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions.mjs';
import { auth } from '@clerk/nextjs/server';
import {prompt} from '@/lib/constants';

// Initialize Groq SDK with the API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();

    // Get session and previous messages from Prisma
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        sessionId,
      },
    });

    // Prepare messages for the LLaMA model
    const messages = session.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
    messages.push({ role: 'user', content: message });

    // Get chat completion from Groq (LLaMA model)
    const chatCompletion = await getGroqChatCompletion(messages);

    const assistantMessage = chatCompletion.choices[0]?.message?.content || '';

    // Save assistant message
    const savedAssistantMessage = await prisma.message.create({
      data: {
        content: assistantMessage,
        role: 'assistant',
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

export async function getGroqChatCompletion(messages: Array<{ role: string; content: string }>) {
  const chatCompletionMessages = 
  [
    {role: 'system', content: prompt},
  ...messages.map(message => ({
    name: 'message',
    role: message.role,
    content: message.content
  }))
  ]

  return groq.chat.completions.create({
    messages: chatCompletionMessages as ChatCompletionMessageParam[],
    model: 'llama3-8b-8192', 
  });
}

export async function GET(req: Request) {
  try {
    const {userId} = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return new NextResponse('Session ID required', { status: 400 });
    }

    //Check if session status is active or not
     const session = await prisma.session.findUnique({
      where: {id: sessionId},
      include: {messages: {orderBy: {createdAt: 'asc'}}}
     });

     if (!session || session.status === 'COMPLETED') {
      return new NextResponse('Session not found or was COMPLETED', { status: 404 });
     }

    // Verify session belongs to user
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