"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Heart, Sparkles } from 'lucide-react';
import { z } from 'zod';

// Define the styles for firework animation
const styles = `
  @keyframes firework {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(var(--dx), var(--dy));
      opacity: 0;
    }
  }
`;

const Fireworks = () => {
  const [particles, setParticles] = useState([]);

  type Particle = {
    x: number;
    y: number;
    color: string;
    size: number;
    dx: number;
    dy: number;
    speed: number;
  }

  useEffect(() => {
    const colors = ['#FFD700', '#FF69B4', '#4169E1', '#32CD32', '#FF4500'];
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 100,
      dy: (Math.random() - 0.5) * 100,
      speed: Math.random() * 2 + 1
    }));
    
    setParticles(newParticles as any);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((p: Particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              animation: `firework ${p.speed}s linear infinite`
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
};

const steps = [
  {
    id: 'personalityType',
    title: 'Personality Type',
    description: 'Are you generally open to new experiences?',
  },
  {
    id: 'communication',
    title: 'Communication Style',
    description: 'How do you prefer to communicate?',
  },
  {
    id: 'loveLanguages',
    title: 'Love Languages',
    description: 'How do you express and receive love?',
  },
  {
    id: 'values',
    title: 'Core Values',
    description: 'What matters most to you?',
  },
];

const loveLanguages = [
  { id: 'quality-time', label: 'Quality Time' },
  { id: 'acts-of-service', label: 'Acts of Service' },
  { id: 'words-of-affirmation', label: 'Words of Affirmation' },
  { id: 'physical-touch', label: 'Physical Touch' },
  { id: 'receiving-gifts', label: 'Receiving Gifts' },
];

const coreValues = [
  { id: 'family', label: 'Family' },
  { id: 'career', label: 'Career Growth' },
  { id: 'personal-growth', label: 'Personal Development' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'spirituality', label: 'Spirituality' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'adventure', label: 'Adventure' },
];

// Comprehensive Zod schema for the entire form
const onboardingSchema = z.object({
  personalityType: z.enum(['open', 'cautious']),
  communicationStyle: z.enum(['direct', 'diplomatic', 'expressive', 'systematic']),
  loveLanguages: z.array(z.string()).min(1).max(3),
  coreValues: z.array(z.string()).min(1).max(5),
});
const PromiseCard = () => (
  <div className="mb-8 text-center space-y-4">
    <h2 className="text-2xl font-bold text-black dark:text-primary">Our Promise to You</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-primary/10 rounded-lg">
        <div className="flex justify-center mb-2">
          <Heart className="h-6 w-6 text-black dark:text-primary animate-pulse" />
        </div>
        <h3 className="font-semibold mb-1">Deeper Understanding</h3>
        <p className="text-sm text-muted-foreground">Gain insights into your relationship dynamics</p>
      </div>
      <div className="p-4 bg-primary/10 rounded-lg">
        <div className="flex justify-center mb-2">
          <Sparkles className="h-6 w-6 text-black dark:text-primary animate-pulse" />
        </div>
        <h3 className="font-semibold mb-1">Guided Growth</h3>
        <p className="text-sm text-muted-foreground">Expert-led journey to strengthen your bond</p>
      </div>
      <div className="p-4 bg-primary/10 rounded-lg">
        <div className="flex justify-center mb-2">
          <Heart className="h-6 w-6 text-black dark:text-primary animate-pulse" />
        </div>
        <h3 className="font-semibold mb-1">Lasting Connection</h3>
        <p className="text-sm text-muted-foreground">Build a foundation for lasting happiness</p>
      </div>
    </div>
  </div>
);
// Individual step schemas
const stepSchemas = [
  z.object({ personalityType: z.enum(['open', 'cautious']) }),
  z.object({ communicationStyle: z.enum(['direct', 'diplomatic', 'expressive', 'systematic']) }),
  z.object({ loveLanguages: z.array(z.string()).min(1).max(3) }),
  z.object({ coreValues: z.array(z.string()).min(1).max(5) }),
];

export default function OnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [formData, setFormData] = useState({
    personalityType: '',
    communicationStyle: '',
    loveLanguages: [] as string[],
    coreValues: [] as string[],
  });
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const response = await fetch('/api/onboarding/check');
        if (response.ok) {
          const data = await response.json();
          if (data.isOnboardingComplete) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [router]);

  const handleComplete = async () => {
    try {
      const validatedData = onboardingSchema.parse(formData);
      console.log('Validated Data:', validatedData);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save onboarding data');
      }
      
      setShowCompletion(true);
      setShowFireworks(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors[0].message);
      } else if (error instanceof Error) {
        setErrors(error.message);
      } else {
        setErrors('An unexpected error occurred');
      }
      console.error('Error saving onboarding data:', error);
    }
  };

  const validateStep = () => {
    try {
      const schema = stepSchemas[currentStep];
      const stepData = {
        personalityType: formData.personalityType,
        communicationStyle: formData.communicationStyle,
        loveLanguages: formData.loveLanguages,
        coreValues: formData.coreValues,
      };
      
      schema.parse(stepData);
      setErrors(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors[0].message);
      }
      return false;
    }
  };
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Label>Are you open to new experiences?</Label>
            <RadioGroup
              onValueChange={(value) => setFormData({ ...formData, personalityType: value })}
              value={formData.personalityType}
              className="grid grid-cols-2 gap-2"
            >
              {['Open', 'Cautious'].map((personalityType) => (
                <div key={personalityType} className="flex items-center space-x-2">
                  <RadioGroupItem value={personalityType.toLowerCase()} id={personalityType} />
                  <Label htmlFor={personalityType}>{personalityType}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Label>How would you describe your communication style?</Label>
            <RadioGroup
              onValueChange={(value) => setFormData({ ...formData, communicationStyle: value })}
              value={formData.communicationStyle}
            >
              {['Direct', 'Diplomatic', 'Expressive', 'Systematic'].map((style) => (
                <div key={style} className="flex items-center space-x-2">
                  <RadioGroupItem value={style.toLowerCase()} id={style} />
                  <Label htmlFor={style}>{style}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Label>Select your love languages (choose up to 3)</Label>
            <div className="grid grid-cols-2 gap-2">
              {loveLanguages.map((language) => (
                <div key={language.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={language.id}
                    checked={formData.loveLanguages.includes(language.id)}
                    onCheckedChange={(checked: boolean) => {
                      const updated = checked
                        ? [...formData.loveLanguages, language.id] as string[]
                        : formData.loveLanguages.filter((id) => id !== language.id);
                      if (!checked || updated.length <= 3) {
                        setFormData({ ...formData, loveLanguages: updated });
                      }
                    }}
                  />
                  <Label htmlFor={language.id}>{language.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Label>Select your core values (choose up to 5)</Label>
            <div className="grid grid-cols-2 gap-2">
              {coreValues.map((value) => (
                <div key={value.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={value.id}
                    checked={formData.coreValues.includes(value.id)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...formData.coreValues, value.id]
                        : formData.coreValues.filter((id) => id !== value.id);
                      if (!checked || updated.length <= 5) {
                        setFormData({ ...formData, coreValues: updated });
                      }
                    }}
                  />
                  <Label htmlFor={value.id}>{value.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/90 to-primary/50 p-4 md:p-8">
      {showFireworks && <Fireworks />}
      
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to Wafaa! 🎉</DialogTitle>
            <DialogDescription>
              Thank you for choosing us to be part of your relationship journey. 
              We're excited to help you build stronger, more meaningful connections.
              Let's start by getting to know you better.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button 
              className="w-full" 
              onClick={() => setShowWelcome(false)}
            >
              Begin Journey
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCompletion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎉 Profile Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you for sharing! We're preparing your personalized relationship journey.
              You'll be redirected to your dashboard in a moment...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-2xl mx-auto">
        <PromiseCard />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
            </div>
            {renderStep()}
            {errors && (
              <p className="text-red-500 mt-2 text-sm">
                {errors}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={async () => {
                if (currentStep === steps.length - 1 && validateStep()) {
                  await handleComplete();
                } else if (validateStep()) {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              {currentStep === steps.length - 1 ? 'Complete Profile' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}