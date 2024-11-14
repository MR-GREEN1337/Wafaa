import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSubscription = () => {
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const { toast } = useToast();

  const cancelSubscription = async () => {
    try {
      setCancelling(true);
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: 'Success',
        description: 'Your subscription will be cancelled at the end of the billing period',
      });

      return await response.json();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel subscription',
        variant: 'destructive',
      });
      return null;
    } finally {
      setCancelling(false);
    }
  };

  const reactivateSubscription = async () => {
    try {
      setReactivating(true);
      const response = await fetch('/api/stripe/reactivate', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: 'Success',
        description: 'Your subscription has been reactivated',
      });

      return await response.json();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reactivate subscription',
        variant: 'destructive',
      });
      return null;
    } finally {
      setReactivating(false);
    }
  };

  return {
    cancelSubscription,
    reactivateSubscription,
    cancelling,
    reactivating,
  };
};