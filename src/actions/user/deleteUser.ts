"use server"

import prisma from "@/lib/prisma";

export async function deleteUser(userId: string) {
  if (!userId) throw new Error("User ID is required");

  // Delete all related data first
  await prisma.$transaction([
    prisma.message.deleteMany({
      where: {
        session: {
          userId: userId
        }
      }
    }),
    prisma.session.deleteMany({
      where: { userId: userId }
    }),
    prisma.relationship.deleteMany({
      where: {
        OR: [
          { partner1Id: userId },
          { partner2Id: userId }
        ]
      }
    }),
    prisma.user.delete({
      where: { id: userId }
    })
  ]);

  return { success: true };
}
