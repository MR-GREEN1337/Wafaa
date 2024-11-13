import { GetSessionsForUser } from '@/actions/sessions/getSessionsForUser'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, InboxIcon } from 'lucide-react'
import React, { Suspense } from 'react'
import CreateSessionDialog from './_components/CreateSessionDialog'
import SessionCard from './_components/SessionCard'

function page() {
  return (
    <div className='flex-1 flex flex-col h-full'>
        <div className='flex justify-between'>
            <div className='flex flex-col'>
                <h1 className='text-3xl font-bold'>Sessions</h1>
                <p className='text-muted-foreground'>Manage your sessions</p>
            </div>
        <CreateSessionDialog />
        </div> 

        <div className='h-full py-6'>
            <Suspense fallback={<UserSessionsSkeleton />}>
                <UserSessions />
            </Suspense>
        </div>
    </div>
  )
}

function UserSessionsSkeleton() {
    return (
        <div className='space-y-5'>
            {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className='h-32 w-[500px]' />
            ))}
        </div>
    )
}

async function UserSessions() {
    const sessions = await GetSessionsForUser();

    if (!sessions) {
        return (
        <Alert>
            <AlertCircle className="w-4 h-4"/>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Something went wrong. Please try again later.
            </AlertDescription>
        </Alert>
        );
    }   

    if (sessions.length === 0) {
        return (
            <div className='flex flex-col gap-4 h-full items-center justify-center'>
                <div className='rounded-full bg-accent w-20 h-20 flex items-center justify-center'>
                    <InboxIcon size={40} className='stroke-primary' />
                </div>
                <div className='flex flex-col gap-1 text-center'>
                    <p className='font-bold'>No session created yet</p>
                    <p className='text-sm text-muted-foreground'>
                        Click the button below to create your first session
                    </p>
                </div>
                <CreateSessionDialog triggerText='Create your first session' />
            </div>
        )
    }
    return (
        <div className='grid grid-cols-1 gap-4'>
            {sessions.map((session) => (
                <SessionCard key={session.id} session={session}/> 
            ))}
        </div>
    )
}

export default page