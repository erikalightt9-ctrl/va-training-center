/**
 * /api/invite/[code]
 *
 * GET  — validate invite code, return tenant branding + role
 * POST — redeem invite (mark as used after successful registration)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ── GET: validate invite ──────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const invite = await prisma.tenantInvite.findUnique({
    where: { code },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          siteName: true,
          slug: true,
          subdomain: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          tagline: true,
          isActive: true,
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid invite link." },
      { status: 404 },
    );
  }

  if (invite.usedAt) {
    return NextResponse.json(
      { success: false, data: null, error: "This invite has already been used." },
      { status: 410 },
    );
  }

  if (new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json(
      { success: false, data: null, error: "This invite link has expired." },
      { status: 410 },
    );
  }

  if (!invite.tenant.isActive) {
    return NextResponse.json(
      { success: false, data: null, error: "This organization is no longer active." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    success: true,
    error: null,
    data: {
      code: invite.code,
      role: invite.role,
      email: invite.email,        // pre-assigned email if any
      expiresAt: invite.expiresAt,
      tenant: {
        name: invite.tenant.siteName ?? invite.tenant.name,
        slug: invite.tenant.slug,
        subdomain: invite.tenant.subdomain,
        logoUrl: invite.tenant.logoUrl,
        primaryColor: invite.tenant.primaryColor ?? "#1E3A8A",
        secondaryColor: invite.tenant.secondaryColor ?? "#1E40AF",
        tagline: invite.tenant.tagline,
      },
    },
  });
}

// ── POST: redeem invite (called after successful user registration) ────────

const redeemSchema = z.object({
  email: z.string().email(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await request.json();
  const result = redeemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, data: null, error: "Email is required." },
      { status: 422 },
    );
  }

  const invite = await prisma.tenantInvite.findUnique({ where: { code } });

  if (!invite || invite.usedAt || new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json(
      { success: false, data: null, error: "Invite is invalid or expired." },
      { status: 410 },
    );
  }

  // Lock invite to the specific email if one was pre-assigned
  if (invite.email && invite.email.toLowerCase() !== result.data.email.toLowerCase()) {
    return NextResponse.json(
      { success: false, data: null, error: "This invite is for a different email address." },
      { status: 403 },
    );
  }

  await prisma.tenantInvite.update({
    where: { code },
    data: { usedAt: new Date(), usedByEmail: result.data.email },
  });

  return NextResponse.json({ success: true, data: { redeemed: true }, error: null });
}
