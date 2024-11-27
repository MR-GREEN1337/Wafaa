"use client"

import React from 'react';
import { useUser } from '@/hooks/use-user';
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Heart, Brain, MessageCircle, Sparkles, Shield, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { isEqual } from 'lodash';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const personalityTypes = {
  INTJ: "Architect: Imaginative and strategic thinkers with a plan for everything.",
  INTP: "Logician: Innovative inventors with an unquenchable thirst for knowledge.",
  ENTJ: "Commander: Bold, imaginative, and strong-willed leaders.",
  ENTP: "Debater: Smart and curious thinkers who cannot resist an intellectual challenge.",
  INFJ: "Advocate: Quiet and mystical, yet very inspiring and tireless idealists.",
  INFP: "Mediator: Poetic, kind, and altruistic people, always eager to help a good cause.",
  ENFJ: "Protagonist: Charismatic and inspiring leaders, able to mesmerize their listeners.",
  ENFP: "Campaigner: Enthusiastic, creative, and sociable free spirits.",
  ISTJ: "Logistician: Practical and fact-minded individuals, reliable and hardworking.",
  ISFJ: "Defender: Very dedicated and warm protectors, always ready to defend their loved ones.",
  ESTJ: "Executive: Excellent administrators, unsurpassed at managing things or people.",
  ESFJ: "Consul: Extraordinarily caring, social, and popular individuals.",
  ISTP: "Virtuoso: Bold and practical experimenters, masters of all kinds of tools.",
  ISFP: "Adventurer: Flexible and charming artists, always ready to explore new things.",
  ESTP: "Entrepreneur: Smart, energetic, and very perceptive individuals.",
  ESFP: "Entertainer: Spontaneous, energetic, and enthusiastic performers."
};

const communicationStyles = [
  "Direct", "Diplomatic", "Analytical", "Intuitive", "Expressive"
];

const loveLanguageOptions = [
  "Words of Affirmation",
  "Quality Time",
  "Physical Touch",
  "Acts of Service",
  "Receiving Gifts"
];

const attachmentStyles = [
  "Secure",
  "Anxious",
  "Avoidant",
  "Disorganized"
];

export const UserProfileForm = ({userId}: {userId: string}) => {
  const {
    user,
    isLoading,
    error,
    updateUser,
    isUpdating,
    deleteUser,
    isDeleting
  } = useUser(userId as string);

  const [initialFormData, setInitialFormData] = React.useState({
    name: '',
    personalityType: '',
    communicationStyle: '',
    loveLanguages: [] as string[],
    coreValues: [] as string[],
    conflictStyle: '',
    attachmentStyle: '',
    stressors: [] as string[],
    interests: [] as string[],
    religiousBelief: ''
  });

  const [formData, setFormData] = React.useState(initialFormData);
  const [activeSection, setActiveSection] = React.useState('personal');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  React.useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        personalityType: user.personalityType || '',
        communicationStyle: user.communicationStyle || '',
        loveLanguages: user.loveLanguages || [],
        coreValues: user.coreValues || [],
        conflictStyle: user.conflictStyle || '',
        attachmentStyle: user.attachmentStyle || '',
        stressors: user.stressors || [],
        interests: user.interests || [],
        religiousBelief: user.religiousBelief || ''
      };
      setInitialFormData(userData);
      setFormData(userData);
    }
  }, [user]);

  const hasChanges = !isEqual(formData, initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setSaveStatus('saving');
    try {
      await updateUser(formData);
      setInitialFormData(formData);
      setSaveStatus('saved');
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const toggleArrayValue = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(v => v !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-red-500 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <p className="font-semibold">Error loading profile</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Define your relationship style and preferences to get better matches and insights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex gap-6">
          <div className="w-1/4 space-y-4">
            <nav className="space-y-1">
              <Button
                variant={activeSection === 'personal' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection('personal')}
                type="button"
              >
                <Brain className="h-4 w-4 mr-2" />
                Personal
              </Button>
                <Button
                  variant={activeSection === 'communication' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('communication')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Communication
                </Button>
                <Button
                  variant={activeSection === 'relationships' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('relationships')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Relationships
                </Button>
                <Button
                  variant={activeSection === 'interests' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('interests')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Interests
                </Button>
              </nav>
            </div>

            <div className="flex-1 space-y-6">
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="max-w-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Personality Type</Label>
                    <TooltipProvider>
                    <div className="grid grid-cols-4 gap-2">
                    {Object.entries(personalityTypes).map(([type, description]) => (
                            <Tooltip key={type}>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant={formData.personalityType === type ? "default" : "outline"}
                                className="h-auto py-2"
                                onClick={() => setFormData(prev => ({ ...prev, personalityType: type }))}
                              >
                                {type}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {description}
                            </TooltipContent>
                          </Tooltip>
                    ))}
                    </div>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-2">
                    <Label>Religious Belief</Label>
                    <Input
                      value={formData.religiousBelief}
                      onChange={(e) => setFormData(prev => ({ ...prev, religiousBelief: e.target.value }))}
                      className="max-w-md"
                      placeholder="Optional - Share your spiritual or religious background"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'communication' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Communication Style</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {communicationStyles.map(style => (
                        <Button
                          key={style}
                          type="button"
                          variant={formData.communicationStyle === style ? 'default' : 'outline'}
                          className="h-auto py-3"
                          onClick={() => setFormData(prev => ({ ...prev, communicationStyle: style }))}
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Love Languages</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {loveLanguageOptions.map(language => (
                        <Button
                          key={language}
                          type="button"
                          variant={formData.loveLanguages.includes(language) ? 'default' : 'outline'}
                          className="h-auto py-3"
                          onClick={() => toggleArrayValue('loveLanguages', language)}
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'relationships' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Attachment Style</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {attachmentStyles.map(style => (
                        <Button
                          key={style}
                          type="button"
                          variant={formData.attachmentStyle === style ? 'default' : 'outline'}
                          className="h-auto py-3"
                          onClick={() => setFormData(prev => ({ ...prev, attachmentStyle: style }))}
                        >
                          {style}
                          <ChevronRight className="h-4 w-4 ml-2 opacity-50" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Core Values</Label>
                    <Input
                      placeholder="Type a value and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !formData.coreValues.includes(value)) {
                            toggleArrayValue('coreValues', value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="max-w-md mb-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      {formData.coreValues.map(value => (
                        <Badge
                          key={value}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleArrayValue('coreValues', value)}
                        >
                          {value} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'interests' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Interests & Hobbies</Label>
                    <Input
                      placeholder="Type an interest and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !formData.interests.includes(value)) {
                            toggleArrayValue('interests', value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="max-w-md mb-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map(interest => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleArrayValue('interests', interest)}
                        >
                          {interest} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Stressors</Label>
                    <Input
                      placeholder="Type a stressor and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !formData.stressors.includes(value)) {
                            toggleArrayValue('stressors', value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="max-w-md mb-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      {formData.stressors.map(stressor => (
                        <Badge
                          key={stressor}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleArrayValue('stressors', stressor)}
                        >
                          {stressor} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" type="button" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteUser()}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Delete Account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-4">
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-600">
                  Changes saved successfully
                </span>
              )}
              <Button 
                type="submit" 
                disabled={isUpdating || saveStatus === 'saving'}
                className="px-6"
              >
                {isUpdating || saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
  );
};

export default UserProfileForm;