"use client"

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Coins, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreditBadgeProps {
  className?: string;
}

interface CreditsResponse {
  credits: number;
  nextRefillAt: string;
  lastRefillAt: string;
}

const CreditBadge = ({ className = '' }: CreditBadgeProps) => {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/credits');
        if (!response.ok) throw new Error('Failed to fetch credits');
        const data: CreditsResponse = await response.json();
        setCredits(data.credits);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load credits',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
    // Set up polling every 5 minutes to keep credits updated
    const interval = setInterval(fetchCredits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-40 px-2 mb-2 ${className} mx-auto`}>
      <Badge 
        variant="outline" 
        className="w-full py-2 flex items-center justify-center gap-2 bg-background/50"
      >
        <Coins className="h-4 w-4 stroke-yellow-400" />
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span>{credits?.toLocaleString() ?? 0} Credits</span>
        )}
      </Badge>
    </div>
  );
};

export default CreditBadge;