import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import Chat from '../_components/Chat';

type Props = Promise<{sessionId: string}>
export default async function Page(props: { params: Props}) {
  const { sessionId } = await props.params;
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
