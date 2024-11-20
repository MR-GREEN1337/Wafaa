import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const OnboardingSidebar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/check');
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding status');
        }
        const data = await response.json();
        setHasOnboarded(data.isOnboardingComplete);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (isLoading || hasOnboarded) {
    return <></>;
  }

  return (
    <Card className="absolute bottom-4 left-4 right-4 bg-card border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Complete Your Profile</CardTitle>
        </div>
        <CardDescription>
          Tell us about yourself to get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => router.push('/onboarding')} 
          className="w-full"
          variant="default"
        >
          Start Onboarding
        </Button>
      </CardContent>
    </Card>
  );
};

export default OnboardingSidebar;