import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { getAssetById, listMaintenance, createMaintenance, resolveMaintenance } from "@/lib/repositories/it-asset.repository";

const createSchema = z.object({
  issueDescription: z.string().min(1),
  vendor:           z.string().max(200).optional(),
  cost:             z.number().nonnegative().optional(),
  notes:            z.string().optional(),
});

const resolveSchema = z.object({
  recordId: z.string().min(1),
  cost:     z.number().nonnegative().optional(),
  notes:    z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const asset  = await getAssetById(guard.tenantId, id);
    if (!asset) return NextResponse.json({ success: false, data: null, error: "Asset not found" }, { status: 404 });

    const records = await listMaintenance(id);
    return NextResponse.json({ success: true, data: records, error: null });
  } catch (err) {
    console.error("[GET /api/admin/it/assets/[id]/maintenance]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body   = await request.json();

    // Resolve an existing record
    if (body.action === "resolve") {
      const parsed = resolveSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, data: null, error: "recordId is required" }, { status: 422 });
      }
      const resolved = await resolveMaintenance(guard.tenantId, parsed.data.recordId, {
        cost:  parsed.data.cost,
        notes: parsed.data.notes,
      });
      return NextResponse.json({ success: true, data: resolved, error: null });
    }

    // Create new record
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });
    }

    const record = await createMaintenance(guard.tenantId, id, parsed.data);
    return NextResponse.json({ success: true, data: record, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/it/assets/[id]/maintenance]", err);
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
