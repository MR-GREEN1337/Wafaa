"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layers2Icon, Loader2, Plus } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CreateSession } from '@/actions/sessions/createSession';
import CreateSessionDialog from './CreateSessionDialog';

const QuickSessionCreator = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const { data: relationships } = useQuery({
    queryKey: ['relationships'],
    queryFn: async () => {
      const response = await fetch('/api/relationships');
      if (!response.ok) {
        throw new Error('Failed to fetch relationships');
      }
      return response.json();
    }
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      name?: string;
      relationshipId?: string;
      description?: string;
      sessionType?: 'individual' | 'joint';
      status?: 'completed' | 'active' | 'archived';
      basis?: 'ISLAMIC' | 'CHRISTIAN' | 'BUDDHIST' | 'JEWISH' | 'SECULAR' | 'INTERFAITH' | 'OTHER';
      customBasis?: string;
    }) => {
      const response = await CreateSession(sessionData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create session');
      }
      return response.data;
    },
    onMutate: () => {
      const loadingToastId = toast.loading("Creating session...");
      return { loadingToastId };
    },
    onSuccess: (data, _, context) => {
      toast.dismiss(context.loadingToastId);
      toast.success("Session created successfully");
      router.push(data.redirectUrl);
    },
    onError: (error, _, context) => {
      toast.dismiss(context.loadingToastId);
      toast.error(error.message);
    }
  });

  const handleQuickCreate = (relationshipId: string, sessionType: 'individual' | 'joint') => {
    const relationship = relationships?.find(r => r.id === relationshipId);
    if (!relationship) return;
    
    const sessionData = {
      relationshipId,
      sessionType,
      name: `${relationship.name} Session - ${new Date().toLocaleDateString()}`,
      description: `Quick session created for ${relationship.name}`,
      status: 'active'
    };

    createSessionMutation.mutate({
      ...sessionData,
      status: 'active' as const
    });
  };

  const hasRelationships = relationships && relationships.length > 0;

  // If there are no relationships, render a simple button that opens the custom session dialog
  if (!hasRelationships) {
    return (
      <Dialog>
        <CreateSessionDialog 
          triggerText={
            <Button className="gap-2" disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  New Session
                </>
              )}
            </Button>
          } 
          context="custom"
        />
      </Dialog>
    );
  }

  // If there are relationships, render the full dropdown menu
  return (
    <div className="relative">
      <DropdownMenu open={isHovered} onOpenChange={setIsHovered}>
        <DropdownMenuTrigger asChild>
          <Button 
            className="gap-2"
            onMouseEnter={() => setIsHovered(true)}
            disabled={createSessionMutation.isPending}
          >
            {createSessionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                New Session
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56"
          onMouseLeave={() => setIsHovered(false)}
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Layers2Icon className="mr-2 h-4 w-4" />
              <span>Quick Individual Session</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                {relationships?.map((relationship) => (
                  <DropdownMenuItem
                    key={relationship.id}
                    onClick={() => handleQuickCreate(relationship.id, 'individual')}
                  >
                    {relationship.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Layers2Icon className="mr-2 h-4 w-4" />
              <span>Quick Joint Session</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                {relationships?.map((relationship) => (
                  <DropdownMenuItem
                    key={relationship.id}
                    onClick={() => handleQuickCreate(relationship.id, 'joint')}
                  >
                    {relationship.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem asChild>
            <Dialog>
              <CreateSessionDialog triggerText="Create Custom Session" context="custom"/>
            </Dialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QuickSessionCreator;