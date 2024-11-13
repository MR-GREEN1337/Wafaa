"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';

const steps = [
  {
    id: 'personalityType',
    title: 'personalityType',
    description: 'Are you generally open to new experiences?',
  },
  {
    id: 'communication',
    title: 'Communication Style',
    description: 'How do you prefer to communicate?',
  },
  {
    id: 'values',
    title: 'Core Values',
    description: 'What matters most to you?',
  },
  {
    id: 'relationships',
    title: 'Relationship Style',
    description: 'How do you approach relationships?',
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

// Zod schemas for each step
const schemas = [
  z.object({ personalityType: z.enum(['open', 'cautious']) }),
  z.object({ communicationStyle: z.enum(['direct', 'diplomatic', 'expressive', 'systematic']) }),
  z.object({ loveLanguages: z.array(z.string()).max(3) }),
  z.object({ coreValues: z.array(z.string()).max(5) }),
];

export default function OnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalityType: '',
    communicationStyle: '',
    loveLanguages: [],
    coreValues: [],
  });
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const response = await fetch('/api/onboarding/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

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

  // If still loading or no user, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary/90 dark:from-rose-900 dark:to-rose-800 p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const progress = ((currentStep + 1) / steps.length) * 100;

  async function onSubmit() {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  }

  const validateStep = () => {
    const schema = schemas[currentStep];
    const result = schema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.errors[0].message);
      return false;
    }
    setErrors(null);
    return true;
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
                        ? [...formData.loveLanguages, language.id]
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
    <div className="min-h-screen bg-primary/90 dark:from-rose-900 dark:to-rose-800 p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
          </div>
          {renderStep()}
          {errors && <p className="text-red-500 mt-2">{errors}</p>}
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
            onClick={() => {
              if (currentStep === steps.length - 1 && validateStep()) {
                onSubmit();
              } else if (validateStep()) {
                setCurrentStep(currentStep + 1);
              }
            }}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
