export interface User {
  id: string;
  email: string;
  name: string;
  personalityType?: string;
  communicationStyle?: string;
  loveLanguages: string[];
  coreValues: string[];
  conflictStyle?: string;
  attachmentStyle?: string;
  stressors: string[];
  interests: string[];
  religiousBelief?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  personalityType?: string;
  communicationStyle?: string;
  loveLanguages?: string[];
  coreValues?: string[];
  conflictStyle?: string;
  attachmentStyle?: string;
  stressors?: string[];
  interests?: string[];
  religiousBelief?: string;
}