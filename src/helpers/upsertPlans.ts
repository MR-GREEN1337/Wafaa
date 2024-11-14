import prisma from '@/lib/prisma';
import { plans } from '@/lib/constants';

export async function upsertPlans() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: {},
      create: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        features: plan.features,
        sessionLimit: plan.sessionLimit,
        relationshipLimit: plan.relationshipLimit,
        monthlyCredits: plan.monthlyCredits,
      },
    });
  }
}