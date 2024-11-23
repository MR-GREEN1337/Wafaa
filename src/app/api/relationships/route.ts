import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { checkAndDeductCredits, InsufficientCreditsError } from "@/lib/credits";
import { UsageType } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, partnerEmail, basis, customBasis } = await req.json();

    // Get current user's email
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check and deduct credits before creating the relationship
    try {
      await checkAndDeductCredits(userId, UsageType.RELATIONSHIP);
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
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

    if (existingRelationship) {
      return NextResponse.json({ error: "Relationship already exists" }, { status: 400 });
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
        },
      });
    }

    // Create the relationship with religious basis
    const relationship = await prisma.relationship.create({
      data: {
        name,
        partner1Id: userId,
        partner2Id: partner.id,
        status: "pending",
        basis: basis || undefined,
        customBasis: basis === "OTHER" ? customBasis : undefined,
        religiousValues: basis ? { 
          framework: basis,
          customDescription: basis === "OTHER" ? customBasis : undefined,
        } : undefined,
        createdAt: new Date(),
      },
    });

    // Send invitation email
    const { data, error: emailError } = await resend.emails.send({
      from: "Relationship App <invitation@resend.dev>",
      to: partnerEmail,
      subject: `${currentUser.name} invited you to connect`,
      react: EmailTemplate({
        name: currentUser.name,
        email: currentUser.email,
        relationshipId: relationship.id,
      }),
    });

    if (emailError) {
      // Log the error but don't fail the request
      console.error("Error sending email:", emailError);
    }

    return NextResponse.json(relationship);
  } catch (error) {
    console.error("Error creating relationship:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ partner1Id: userId }, { partner2Id: userId }],
        status: "ACTIVE",
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
        basis: true,
        customBasis: true,
        religiousValues: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRelationships = relationships.map((rel) => ({
      id: rel.id,
      name: rel.name,
      partner1Id: rel.partner1.id,
      partner2Id: rel.partner2.id,
      partner1Name: rel.partner1.name || "Unknown",
      partner2Name: rel.partner2.name || "Unknown",
      status: rel.status,
      basis: rel.basis,
      customBasis: rel.customBasis,
      religiousValues: rel.religiousValues,
    }));

    return NextResponse.json(formattedRelationships);
  } catch (error) {
    console.error("[RELATIONSHIPS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}