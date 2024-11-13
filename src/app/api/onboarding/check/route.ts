// app/api/onboarding/check/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        personalityType: true,
        communicationStyle: true,
        loveLanguages: true,
        coreValues: true,
      },
    });

    // Check if all required onboarding fields are filled
    const isOnboardingComplete = user && 
      user.personalityType && 
      user.communicationStyle && 
      user.loveLanguages?.length > 0 && 
      user.coreValues?.length > 0;

    return NextResponse.json({ 
      isOnboardingComplete,
      userData: user 
    });

  } catch (error) {
    console.error('[ONBOARDING_CHECK_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}