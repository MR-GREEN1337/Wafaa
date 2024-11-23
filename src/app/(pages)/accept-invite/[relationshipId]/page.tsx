import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, UserPlus, X } from 'lucide-react';
import AcceptRelationshipButton from './_components/AcceptRelationshipButton';
import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    relationshipId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const Page = async ({ params }: PageProps) => {
  const { relationshipId } = params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle className="text-center text-red-500">Unauthorized</CardTitle>
          <CardDescription className="text-center">
            Please sign in to view this invitation
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check if relationship exists and get full details
  const relationship = await prisma.relationship.findFirst({
    where: {
      id: relationshipId,
      OR: [
        { partner1Id: userId },
        { partner2Id: userId }
      ]
    },
    include: {
      partner1: {
        select: {
          name: true,
          email: true
        }
      },
      partner2: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!relationship) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle className="text-center text-red-500">Not Found</CardTitle>
          <CardDescription className="text-center">
            This invitation either doesn't exist or you don't have permission to view it
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If relationship is already active, redirect to relationship page
  if (relationship.status === 'active') {
    redirect(`/dashboard/relationships/${relationshipId}`);
  }

  const isInviter = relationship.partner1Id === userId && (relationship.partner1.email === userId); // Shitty but keep it for now
  const partner = isInviter ? relationship.partner2 : relationship.partner1;
  const inviter = isInviter ? relationship.partner1 : relationship.partner2;

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">Relationship Invitation</CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            {isInviter 
              ? `Waiting for ${partner.name} to accept`
              : `${inviter.name} has invited you to connect`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Relationship Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{relationship.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{relationship.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Inviter</p>
                <p className="font-medium">{inviter.name}</p>
                <p className="text-sm text-muted-foreground">{inviter.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Invitee</p>
                <p className="font-medium">{partner.name}</p>
                <p className="text-sm text-muted-foreground">{partner.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {!isInviter && relationship.status === 'pending' && (
            <>
              <AcceptRelationshipButton relationshipId={relationshipId} />
              <Button variant="destructive">
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </>
          )}
          {isInviter && (
            <div className="text-center text-muted-foreground">
              Waiting for partner to accept the invitation...
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;