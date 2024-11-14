import prisma from "@/lib/prisma";
import { CreditTransactionType, UsageType } from "@prisma/client";

export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export async function checkAndDeductCredits(
  userId: string,
  usageType: UsageType,
  quantity: number = 1
): Promise<void> {
  // Start a transaction to ensure atomic operations
  await prisma.$transaction(async (tx) => {
    // Get user's subscription and credit balance
    const subscription = await tx.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { credits: true }
    });

    if (!subscription || !subscription.credits) {
      throw new InsufficientCreditsError("No active subscription found");
    }

    // Get credit cost for the usage type
    const creditCost = await getCreditCost(usageType);
    const totalCost = creditCost * quantity;

    // Check if user has sufficient credits
    if (subscription.credits.amount < totalCost) {
      throw new InsufficientCreditsError(
        `Insufficient credits. Required: ${totalCost}, Available: ${subscription.credits.amount}`
      );
    }

    // Deduct credits and record transaction
    await tx.creditBalance.update({
      where: { subscriptionId: subscription.id },
      data: { amount: subscription.credits.amount - totalCost }
    });

    // Record the transaction
    await tx.creditTransaction.create({
      data: {
        subscriptionId: subscription.id,
        amount: -totalCost,
        type: CreditTransactionType.USAGE,
        description: `Used ${totalCost} credits for ${usageType}`,
        metadata: { usageType, quantity }
      }
    });

    // Record usage
    await tx.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        type: usageType,
        quantity,
        creditsUsed: totalCost
      }
    });
  });
}

async function getCreditCost(usageType: UsageType): Promise<number> {
  // Define credit costs for different usage types
  const creditCosts = {
    [UsageType.SESSION]: 1,
    [UsageType.RELATIONSHIP]: 5,
    [UsageType.ANALYSIS]: 2
  };

  return creditCosts[usageType];
}