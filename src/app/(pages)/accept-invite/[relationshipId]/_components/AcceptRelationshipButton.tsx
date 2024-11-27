"use client"

import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { acceptRelationship } from '@/actions/relationships/acceptRelationship';

export default function AcceptRelationshipButton({ 
  relationshipId 
}: { 
  relationshipId: string 
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccept = () => {
    startTransition(async () => {
      try {
        //console.log(relationshipId)
        await acceptRelationship(relationshipId);
        toast.success('Relationship accepted successfully!');
        router.push(`/dashboard/relationships/${relationshipId}`);
      } catch (error) {
        toast.error('Failed to accept relationship');
      }
    });
  };

  return (
    <Button 
      onClick={handleAccept} 
      disabled={isPending}
      className="min-w-[120px]"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Check className="w-4 h-4 mr-2" />
          Accept
        </>
      )}
    </Button>
  );
}