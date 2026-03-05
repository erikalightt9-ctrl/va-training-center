import { prisma } from "@/lib/prisma";

/**
 * Generates a unique payment reference code in the format VTC-YYYY-NNNNN.
 * Uses a count-based approach with collision retry.
 * The @unique constraint on Enrollment.referenceCode is the ultimate safety net.
 */
export async function generateReferenceCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VTC-${year}-`;

  const count = await prisma.enrollment.count({
    where: {
      referenceCode: { startsWith: prefix },
    },
  });

  const code = `${prefix}${String(count + 1).padStart(5, "0")}`;

  const existing = await prisma.enrollment.findUnique({
    where: { referenceCode: code },
  });

  if (!existing) {
    return code;
  }

  // Collision detected — retry with incremented sequence
  return retryReferenceCode(prefix, count + 2);
}

async function retryReferenceCode(
  prefix: string,
  startFrom: number,
  maxAttempts = 5
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = `${prefix}${String(startFrom + i).padStart(5, "0")}`;
    const existing = await prisma.enrollment.findUnique({
      where: { referenceCode: code },
    });
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique reference code after retries");
}
