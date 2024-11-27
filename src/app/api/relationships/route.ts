import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { checkAndDeductCredits, InsufficientCreditsError } from "@/lib/credits";
import { RelationshipBasis, UsageType } from "@prisma/client";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

// Input validation schema
const createRelationshipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  partnerEmail: z.string().email("Invalid email address"),
  basis: z.enum([
    "ISLAMIC",
    "CHRISTIAN",
    "BUDDHIST",
    "JEWISH",
    "SECULAR",
    "INTERFAITH",
    "OTHER"
  ] as const).optional(),
  customBasis: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createRelationshipSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, partnerEmail, basis, customBasis } = validationResult.data;

    // Get current user's information
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: {
          select: {
            id: true,
            status: true,
          }
        }
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify subscription status
    if (currentUser.subscription?.status !== "ACTIVE" && 
        currentUser.subscription?.status !== "TRIALING") {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    // Check for existing relationship
    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          {
            AND: [
              { partner1: { email: currentUser.email } },
              { partner2: { email: partnerEmail } },
            ],
          },
          {
            AND: [
              { partner1: { email: partnerEmail } },
              { partner2: { email: currentUser.email } },
            ],
          },
        ],
      },
    });

    if (existingRelationship) {
      return NextResponse.json(
        { error: "Relationship already exists" },
        { status: 409 }
      );
    }

    // Check relationship limit
    const relationshipCount = await prisma.relationship.count({
      where: {
        OR: [
          { partner1Id: userId },
          { partner2Id: userId }
        ],
        status: {
          in: ["active", "pending"]
        }
      },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (subscription && relationshipCount >= subscription.plan.relationshipLimit) {
      return NextResponse.json(
        { error: "Relationship limit reached for your plan" },
        { status: 403 }
      );
    }

    // Check and deduct credits
    try {
      await checkAndDeductCredits(userId, UsageType.RELATIONSHIP);
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 402 }  // Note: This is a 402 Payment Required status
        );
      }
      throw error;
    }

    // Create or get partner user
    let partner = await prisma.user.findUnique({
      where: { email: partnerEmail },
    });

    if (!partner) {
      partner = await prisma.user.create({
        data: {
          email: partnerEmail,
          name: partnerEmail.split("@")[0],
          onboardingCompleted: false,
        },
      });
    }

    // Create the relationship
    const relationship = await prisma.relationship.create({
      data: {
        name,
        partner1Id: currentUser.id,  // Authenticated user is always partner1
        partner2Id: partner.id,      // Invited user is always partner2
        status: "pending",           // Start as pending until partner2 accepts
        basis: basis as RelationshipBasis | null || null,
        customBasis: basis === "OTHER" ? customBasis : null,
        religiousValues: basis ? {
          framework: basis,
          customDescription: basis === "OTHER" ? customBasis : null,
        } : null,
      },
      include: {
        partner1: {
          select: {
            name: true,
            email: true,
          },
        },
        partner2: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send invitation email
    try {
      await resend.emails.send({
        from: "Relationship App <invitation@wafaa-ai.com>",
        to: partnerEmail,
        subject: `${currentUser.name} invited you to connect`,
        react: EmailTemplate({
          name: currentUser.name,
          email: currentUser.email,
          relationshipId: relationship.id,
        }),
      });
    } catch (error) {
      console.error("Error sending invitation email:", error);
      // Log but don't fail the request
    }

    // Create initial welcome message
    await prisma.message.create({
      data: {
        content: `Welcome to your relationship space! ${currentUser.name} has invited ${partner.name} to connect.`,
        role: "system",
        sessionId: (await prisma.session.create({
          data: {
            name: "Welcome",
            description: "Initial welcome session",
            sessionType: "welcome",
            status: "active",
            userId: currentUser.id,
            relationshipId: relationship.id,
          },
        })).id,
      },
    });

    return NextResponse.json({
      success: true,
      relationship: {
        id: relationship.id,
        name: relationship.name,
        status: relationship.status,
        partner1: relationship.partner1,
        partner2: relationship.partner2,
        basis: relationship.basis,
        customBasis: relationship.customBasis,
      },
    });

  } catch (error) {
    console.error("Error creating relationship:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { partner1Id: userId },
          { partner2Id: userId }
        ],
      },
      select: {
        id: true,
        name: true,
        partner1: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        partner2: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        status: true,
        basis: true,
        customBasis: true,
        religiousValues: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(relationships);
  } catch (error) {
    console.error("Error fetching relationships:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
