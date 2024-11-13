"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteSession(sessionId: string): Promise<void> {
  // TODO: Implement deleteSession
  const {userId} = await auth();

  if (!userId) {
      throw new Error("User not authenticated");
  }
  const id = sessionId
  await prisma.session.delete({
      where: {
          id,
          userId,
      },
  });
}