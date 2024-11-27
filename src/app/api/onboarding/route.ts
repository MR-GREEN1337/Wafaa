import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define the schema for onboarding data validation
const onboardingSchema = z.object({
  personalityType: z.enum(["open", "cautious"]),
  communicationStyle: z.enum(["direct", "diplomatic", "expressive", "systematic"]),
  loveLanguages: z.array(z.string()).min(1).max(3),
  coreValues: z.array(z.string()).min(1).max(5),
});

const ONBOARDING_BONUS_CREDITS = 5; // Welcome bonus credits

export async function POST(req: Request) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user details from Clerk
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    
    // Parse request body
    const body = await req.json();
    
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Request body is required" },
        { status: 400 }
      );
    }

    // Validate the data
    const validatedData = onboardingSchema.parse(body);

    // Find or create user and find their active subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // If user has not completed onboarding, update user and add credits
    if (!user.onboardingCompleted) {
      // Update user with onboarding data and mark as completed
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          personalityType: validatedData.personalityType,
          communicationStyle: validatedData.communicationStyle,
          loveLanguages: validatedData.loveLanguages,
          coreValues: validatedData.coreValues,
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
        include: { subscription: true }
      });

      // Check if user has an active subscription
      if (user.subscription) {
        // Add onboarding bonus credits
        const creditTransaction = await prisma.creditTransaction.create({
          data: {
            subscriptionId: user.subscription.id,
            amount: ONBOARDING_BONUS_CREDITS,
            type: 'BONUS',
            description: 'Onboarding Bonus Credits',
            metadata: { 
              source: 'onboarding', 
              userId: userId 
            }
          }
        });

        // Update credit balance
        await prisma.creditBalance.update({
          where: { subscriptionId: user.subscription.id },
          data: {
            amount: { increment: ONBOARDING_BONUS_CREDITS }
          }
        });

        return NextResponse.json({
          success: true,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            personalityType: updatedUser.personalityType,
            communicationStyle: updatedUser.communicationStyle,
            loveLanguages: updatedUser.loveLanguages,
            coreValues: updatedUser.coreValues,
          },
          credits: {
            bonus: ONBOARDING_BONUS_CREDITS,
            message: 'Welcome bonus credits added!'
          }
        });
      }
    }

    // If user has already completed onboarding
    return NextResponse.json(
      { 
        success: false, 
        error: "Onboarding already completed" 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation error", 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Handle Prisma or other errors
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error", 
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
