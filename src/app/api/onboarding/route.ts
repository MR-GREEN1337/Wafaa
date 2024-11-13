import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        communicationStyle: data["communicationStyle"] || '',
        loveLanguages: data["loveLanguages"] || '',
        coreValues: data["coreValues"] || '',
        conflictStyle: data["conflictStyle"] || '',
        attachmentStyle: data["attachmentStyle"] || '',
        personalityType: data["personalityType"] || '',
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
