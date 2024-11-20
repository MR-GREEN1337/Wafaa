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

    // Try to find existing user in database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Create new user if they don't exist
      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : "",
          personalityType: validatedData.personalityType,
          communicationStyle: validatedData.communicationStyle,
          loveLanguages: validatedData.loveLanguages,
          coreValues: validatedData.coreValues,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          personalityType: validatedData.personalityType,
          communicationStyle: validatedData.communicationStyle,
          loveLanguages: validatedData.loveLanguages,
          coreValues: validatedData.coreValues,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        personalityType: user.personalityType,
        communicationStyle: user.communicationStyle,
        loveLanguages: user.loveLanguages,
        coreValues: user.coreValues,
      }
    });

  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    // Handle Clerk API errors
    if ((error as any).code === 'clerk_error') {
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication service error",
          message: (error as Error).message
        },
        { status: 500 }
      );
    }

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

    // Handle Prisma errors
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Server error", 
          message: error.message 
        },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}