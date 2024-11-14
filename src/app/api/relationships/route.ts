import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { NextApiResponse } from "next";
import { checkAndDeductCredits, InsufficientCreditsError } from "@/lib/credits";
import { UsageType } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch relationships where user is either partner1 or partner2
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ partner1Id: userId }, { partner2Id: userId }],
        status: "active", // Only fetch active relationships
      },
      select: {
        id: true,
        name: true,
        partner1: {
          select: {
            id: true,
            name: true,
          },
        },
        partner2: {
          select: {
            id: true,
            name: true,
          },
        },
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // Transform the data to include partner information
    const formattedRelationships = relationships.map((rel) => ({
      id: rel.id,
      name: rel.name,
      partner1Id: rel.partner1.id,
      partner2Id: rel.partner2.id,
      partner1Name: rel.partner1.name,
      partner2Name: rel.partner2.name,
      status: rel.status,
    }));

    return NextResponse.json(formattedRelationships);
  } catch (error) {
    console.error("[RELATIONSHIPS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request, res: NextApiResponse) {
  // Method to create a new relationship: sending an invitation to a partner
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, partnerEmail } = await req.json();

    // Get current user's email
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check and deduct credits before creating the relationship
    try {
      await checkAndDeductCredits(userId, UsageType.RELATIONSHIP);
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return new NextResponse("Insufficient credits", { status: 402 });
      }
      throw error;
    }

    // Check if relationship already exists
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
    console.log("Existing relationship:", existingRelationship);
    if (existingRelationship) {
      return new NextResponse("Relationship already exists", { status: 400 });
    }

    // Create or get partner user
    let partner = await prisma.user.findUnique({
      where: { email: partnerEmail },
    });

    if (!partner) {
      // Create a placeholder user for the partner
      partner = await prisma.user.create({
        data: {
          email: partnerEmail,
          name: partnerEmail.split("@")[0], // Temporary name from email
        },
      });
    }

    // Create the relationship
    const relationship = await prisma.relationship.create({
      data: {
        name,
        partner1Id: userId,
        partner2Id: partner.id,
        status: "pending",
        createdAt: new Date(),
      },
    });

    // Send invitation email
    const { data, error } = await resend.emails.send({
      from: "Relationship App <invitation@resend.dev>",
      to: partnerEmail,
      subject: `${currentUser.name} invited you to connect`,
      react: EmailTemplate({
        name: currentUser.name,
        email: currentUser.email,
        relationshipId: relationship.id,
      }),
    });

    if (error) {
      return NextResponse.json(error);
    }

    return NextResponse.json(relationship);
  } catch (error) {
    console.error("Error creating relationship:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
