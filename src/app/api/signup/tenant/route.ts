import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createTenant } from "@/lib/repositories/superadmin.repository";
import { sendTenantWelcomeEmail } from "@/lib/email/send-tenant-welcome";

const signupSchema = z.object({
  orgName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100),
  subdomain: z
    .string()
    .min(2, "Subdomain must be at least 2 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Subdomain may only contain lowercase letters, numbers, and hyphens"),
  industry: z.string().max(100).optional(),
  adminName: z.string().min(2, "Name must be at least 2 characters").max(100),
  adminEmail: z.string().email("Invalid email address").toLowerCase(),
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

/* ------------------------------------------------------------------ */
/*  POST — Public self-service tenant signup (creates TRIAL tenant)    */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0].message },
        { status: 422 },
      );
    }

    const { orgName, subdomain, industry, adminName, adminEmail, adminPassword } = parsed.data;

    // Derive a unique slug from subdomain
    const slug = subdomain;

    // Check for conflicts (email, slug, subdomain)
    const [existingOrg, existingEmail] = await Promise.all([
      prisma.organization.findFirst({
        where: { OR: [{ slug }, { subdomain }] },
        select: { id: true },
      }),
      prisma.corporateManager.findFirst({
        where: { email: adminEmail },
        select: { id: true },
      }),
    ]);

    if (existingOrg) {
      return NextResponse.json(
        { success: false, data: null, error: "That subdomain is already taken. Please choose another." },
        { status: 409 },
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { success: false, data: null, error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

    const { org } = await createTenant({
      name: orgName,
      slug,
      subdomain,
      email: adminEmail,
      industry: industry || undefined,
      plan: "TRIAL",
      adminName,
      adminEmail,
      adminPasswordHash,
    });

    // Non-blocking welcome email
    sendTenantWelcomeEmail({
      orgName: org.name,
      subdomain: org.subdomain ?? subdomain,
      plan: "TRIAL",
      adminName,
      adminEmail,
      temporaryPassword: adminPassword,
    }).catch((err) => {
      console.error("[POST /api/signup/tenant] welcome email failed:", err);
    });

    return NextResponse.json(
      {
        success: true,
        data: { orgId: org.id, orgName: org.name, subdomain: org.subdomain },
        error: null,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/signup/tenant]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
