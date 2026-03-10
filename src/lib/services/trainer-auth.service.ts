import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 12;
const TEMP_PASSWORD_LENGTH = 12;

/**
 * Generate a random temporary password for a trainer.
 */
export function generateTrainerPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  const bytes = crypto.randomBytes(TEMP_PASSWORD_LENGTH);
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

/**
 * Grant login access to a trainer by generating credentials.
 * Returns the plain-text temporary password (for admin to share).
 */
export async function grantTrainerAccess(
  trainerId: string,
): Promise<{ readonly temporaryPassword: string }> {
  const temporaryPassword = generateTrainerPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);

  await prisma.trainer.update({
    where: { id: trainerId },
    data: {
      passwordHash,
      accessGranted: true,
    },
  });

  return { temporaryPassword };
}

/**
 * Revoke login access for a trainer.
 */
export async function revokeTrainerAccess(
  trainerId: string,
): Promise<void> {
  await prisma.trainer.update({
    where: { id: trainerId },
    data: {
      accessGranted: false,
    },
  });
}

/**
 * Reset a trainer's password and return the new temporary password.
 */
export async function resetTrainerPassword(
  trainerId: string,
): Promise<{ readonly temporaryPassword: string }> {
  const temporaryPassword = generateTrainerPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);

  await prisma.trainer.update({
    where: { id: trainerId },
    data: { passwordHash },
  });

  return { temporaryPassword };
}
