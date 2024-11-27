import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

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
    return null;
  }

  return (
    <Card 
      className="
        absolute bottom-4 left-4 right-4 
        bg-gradient-to-br from-card to-primary/10 
        border-primary/30 
        shadow-lg 
        hover:shadow-xl 
        transition-all 
        duration-300
      "
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Complete Your Profile</CardTitle>
          </div>
          <Badge 
            variant="default" 
            className="animate-pulse flex items-center gap-1"
          >
            <Gift className="h-4 w-4" />
            5 Credits
          </Badge>
        </div>
        <CardDescription className="mt-2">
          Tell us about yourself and receive a <span className="font-semibold text-primary">5-credit welcome bonus!</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => router.push('/onboarding')} 
          className="
            w-full 
            group 
            hover:bg-primary/90 
            transition-all 
            duration-300
          "
          variant="default"
        >
          <span className="flex items-center gap-2">
            Start Onboarding 
            <Gift 
              className="
                h-4 w-4 
                transition-transform 
                duration-300 
                group-hover:rotate-12 
                group-hover:scale-110
              " 
            />
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default OnboardingSidebar;