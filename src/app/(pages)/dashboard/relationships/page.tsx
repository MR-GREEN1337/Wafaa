import { auth } from '@clerk/nextjs/server';
import React, { Suspense } from 'react';
import RelationshipCard from './_components/RelationshipCard';
import { Heart, InboxIcon } from 'lucide-react';
import CreateRelationshipDialog from './_components/CreateRelationshipDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { GetRelationshipsForUser } from '@/actions/relationships/GetRelationshipsForUser';

async function Page() {
    const { userId } = await auth();
    if (!userId) {
        return <div>Unauthorized</div>;
    }
    return (
        <div className='flex-1 flex flex-col h-full'>
        <div className='flex justify-between'>
            <div className='flex flex-col gap-2'>
                <div className='flex flex-row'>
                <h1 className='text-3xl font-bold'>Relationships</h1>
                <Heart className='animate-pulse ml-2' size={30}/>
                </div>
                <p className='text-muted-foreground'>Manage your relationships - Add or delete</p>
            </div>
        <CreateRelationshipDialog triggerText='Create a relationship' />
        </div> 
        <div className='h-full py-6'>
            <Suspense fallback={<RelationshipsSkeleton />}>
                <UserRelationships userId={userId as string} />
            </Suspense>
        </div>
    </div>
    )
}
    function RelationshipsSkeleton() {
        return (
            <div className='space-y-5'>
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className='h-32 w-[500px]' />
                ))}
            </div>
        )
    }
    
async function UserRelationships(userId: {userId: string}) {
    const relationships = await GetRelationshipsForUser();
    if (relationships.length === 0) {
        return (
            <div className='flex flex-col gap-4 h-full items-center justify-center'>
                <div className='rounded-full bg-accent w-20 h-20 flex items-center justify-center'>
                    <InboxIcon size={40} className='stroke-primary' />
                </div>
                <div className='flex flex-col gap-1 text-center'>
                    <p className='font-bold'>No relationship created yet</p>
                    <p className='text-sm text-muted-foreground'>
                        Click the button below to create your first session
                    </p>
                </div>
                <CreateRelationshipDialog triggerText='Create your first relationship' />
            </div>
        )
    }
    //console.log(relationships)
    return (
        <div className='grid grid-cols-1 gap-4'>
            {relationships.map((relationship) => (
                <RelationshipCard key={relationship.id} relationship={relationship as any} currentUserId={userId.userId} /> 
            ))}
        </div>
    )
}

export default Page;
