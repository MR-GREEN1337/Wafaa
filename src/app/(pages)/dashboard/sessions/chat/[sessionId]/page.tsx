import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import Chat from '../_components/Chat';

async function Page({ params }: { params: { sessionId: string } }) {
    const { sessionId } = params;
    const { userId } = await auth();

    if (!userId) {
        return <div>Unauthorized</div>;
    }

    const sessionWithMessages = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      });

    if (!sessionWithMessages) {
        return <div>Session not found</div>;
    }

    return <Chat session={{...sessionWithMessages, messages: []}} />;
}

export default Page;
