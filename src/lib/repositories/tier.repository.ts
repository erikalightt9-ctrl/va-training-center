import { prisma } from "@/lib/prisma";
import type { TrainingTier } from "@prisma/client";

export type TierInput = {
  name: string;
  price: number;
  description?: string;
  features: string[];
  isActive?: boolean;
  order?: number;
};

export async function getActiveTiers(): Promise<TrainingTier[]> {
  return prisma.trainingTier.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getAllTiers(): Promise<TrainingTier[]> {
  return prisma.trainingTier.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getTierById(id: string): Promise<TrainingTier | null> {
  return prisma.trainingTier.findUnique({ where: { id } });
}

export async function createTier(data: TierInput): Promise<TrainingTier> {
  return prisma.trainingTier.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      features: data.features,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
    },
  });
}

export async function updateTier(id: string, data: Partial<TierInput>): Promise<TrainingTier> {
  return prisma.trainingTier.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.features !== undefined && { features: data.features }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });
}

export async function deleteTier(id: string): Promise<void> {
  await prisma.trainingTier.delete({ where: { id } });
}
