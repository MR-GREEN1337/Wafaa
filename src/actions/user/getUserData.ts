"use server"

import prisma from "@/lib/prisma";

export async function getUserData(userId: string) {
  if (!userId) throw new Error("User ID is required");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      personalityType: true,
      communicationStyle: true,
      loveLanguages: true,
      coreValues: true,
      conflictStyle: true,
      attachmentStyle: true,
      stressors: true,
      interests: true,
      religiousBelief: true,
      onboardingCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}