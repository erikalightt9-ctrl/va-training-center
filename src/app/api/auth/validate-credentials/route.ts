/**
 * POST /api/auth/validate-credentials
 *
 * Lightweight pre-login check — no bcrypt, no session creation.
 * Checks only operational access-control gates so the portal UI
 * can show a specific, actionable error message before calling signIn().
 *
 * Request body: { provider: "student" | "trainer", email: string }
 *
 * Responses:
 *   200 ok            { ok: true,  mustChangePassword: boolean }
 *   200 blocked       { ok: false, error: string }   ← show this in the UI
 *   200 not_found     { ok: null }                   ← fall through to signIn()
 *   422               { ok: false, error: "Invalid input" }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;

const bodySchema = z.object({
  provider: z.enum(["student", "trainer", "auto"]),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 422 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 422 });
  }

  const { provider, email } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  /* ── student ────────────────────────────────────────────────── */
  if (provider === "student") {
    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      select: {
        failedAttempts: true,
        accessGranted: true,
        accessExpiry: true,
        mustChangePassword: true,
      },
    });

    // User not found → return null so UI falls through to generic error
    if (!student) return NextResponse.json({ ok: null });

    if (student.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      return NextResponse.json({
        ok: false,
        error: "Account locked after too many failed attempts. Please contact admin.",
      });
    }

    if (!student.accessGranted) {
      return NextResponse.json({
        ok: false,
        error: "Your access has not been granted yet. Please contact admin.",
      });
    }

    if (student.accessExpiry && new Date(student.accessExpiry) < new Date()) {
      return NextResponse.json({
        ok: false,
        error: "Your access has expired. Please contact admin to renew.",
      });
    }

    return NextResponse.json({
      ok: true,
      mustChangePassword: student.mustChangePassword,
    });
  }

  /* ── auto-detect (Tenant Portal unified login) ──────────────── */
  if (provider === "auto") {
    // 1. Check student
    const studentAuto = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      select: { failedAttempts: true, accessGranted: true, accessExpiry: true, mustChangePassword: true },
    });
    if (studentAuto) {
      if (studentAuto.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        return NextResponse.json({ ok: false, error: "Account locked after too many failed attempts. Please contact admin." });
      }
      if (!studentAuto.accessGranted) {
        return NextResponse.json({ ok: false, error: "Your access has not been granted yet. Please contact admin." });
      }
      if (studentAuto.accessExpiry && new Date(studentAuto.accessExpiry) < new Date()) {
        return NextResponse.json({ ok: false, error: "Your access has expired. Please contact admin to renew." });
      }
      return NextResponse.json({ ok: true, provider: "student", mustChangePassword: studentAuto.mustChangePassword });
    }

    // 2. Check corporate manager / tenant admin
    const manager = await prisma.corporateManager.findFirst({
      where: { email: normalizedEmail },
      select: { isActive: true, mustChangePassword: true },
    });
    if (manager) {
      if (!manager.isActive) {
        return NextResponse.json({ ok: false, error: "Your account has been deactivated. Please contact admin." });
      }
      return NextResponse.json({ ok: true, provider: "corporate", mustChangePassword: manager.mustChangePassword });
    }

    // 3. Check trainer
    const trainerAuto = await prisma.trainer.findUnique({
      where: { email: normalizedEmail },
      select: { passwordHash: true, failedAttempts: true, isActive: true, accessGranted: true, mustChangePassword: true },
    });
    if (trainerAuto && trainerAuto.passwordHash) {
      if (trainerAuto.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        return NextResponse.json({ ok: false, error: "Account locked after too many failed attempts. Please contact admin." });
      }
      if (!trainerAuto.isActive) {
        return NextResponse.json({ ok: false, error: "Your account has been deactivated. Please contact admin." });
      }
      if (!trainerAuto.accessGranted) {
        return NextResponse.json({ ok: false, error: "Your portal access has not been granted yet. Please contact admin." });
      }
      return NextResponse.json({ ok: true, provider: "trainer", mustChangePassword: trainerAuto.mustChangePassword });
    }

    // Not found in any table
    return NextResponse.json({ ok: null });
  }

  /* ── trainer ────────────────────────────────────────────────── */
  const trainer = await prisma.trainer.findUnique({
    where: { email: normalizedEmail },
    select: {
      passwordHash: true,
      failedAttempts: true,
      isActive: true,
      accessGranted: true,
      mustChangePassword: true,
    },
  });

  // No account or no password set → fall through to generic error
  if (!trainer || !trainer.passwordHash) return NextResponse.json({ ok: null });

  if (trainer.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return NextResponse.json({
      ok: false,
      error: "Account locked after too many failed attempts. Please contact admin.",
    });
  }

  if (!trainer.isActive) {
    return NextResponse.json({
      ok: false,
      error: "Your account has been deactivated. Please contact admin.",
    });
  }

  if (!trainer.accessGranted) {
    return NextResponse.json({
      ok: false,
      error:
        "Your portal access has not been granted yet. Please contact admin.",
    });
  }

  return NextResponse.json({
    ok: true,
    mustChangePassword: trainer.mustChangePassword,
  });
}
