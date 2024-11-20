"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const OnboardingCheckDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/check');
        
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding status');
        }

        const data = await response.json();
        
        if (!data.isOnboardingComplete) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleContinueToOnboarding = () => {
    router.push('/onboarding');
  };

  if (isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-bold">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Before you can continue, we need some information to personalize your experience.
            This will help us provide better recommendations and insights.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            We&apos;ll ask you about your:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>Personality type</li>
            <li>Communication style</li>
            <li>Love languages</li>
            <li>Core values</li>
          </ul>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleContinueToOnboarding}>
            Continue to Onboarding
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingCheckDialog;