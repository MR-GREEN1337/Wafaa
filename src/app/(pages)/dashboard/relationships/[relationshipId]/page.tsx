import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import RelationshipReport from './_components/RelationshipReport';
import { getOrGenerateAnalysis } from '@/actions/reports/generateReport';

async function Page({ params }: { params: { relationshipId: string } }) {
    // TODO: Display data about the relationship from previous sessions, charts and paragraph
    const { relationshipId } = params;
    const { userId } = await auth();

    if (!userId) {
        return <div>Unauthorized</div>;
    }

    const relationship = await prisma.relationship.findUnique({
        where: {
          id: relationshipId,
          OR: [
            { partner1Id: userId },
            { partner2Id: userId }
          ],
        },
      });

    if (!relationship) {
        return <div>relationship not found</div>;
    }

    const analysis = await getOrGenerateAnalysis(relationship.id)

    return (
        <RelationshipReport analysis={analysis as any}/>
    );
}

export default Page;
