'use server'

import prisma from "@/lib/prisma";
import { UpdateUserInput } from "@/types/user";


export async function updateUser(userId: string, data: UpdateUserInput) {
  if (!userId) throw new Error("User ID is required");

  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}