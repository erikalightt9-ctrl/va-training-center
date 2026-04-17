import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { put } from "@vercel/blob";
import {
  listEmployeeDocuments,
  createEmployeeDocument,
} from "@/lib/repositories/hr-employee.repository";
import { logAction } from "@/lib/repositories/acc-audit.repository";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/jpg": "JPG",
  "image/png": "PNG",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const docs = await listEmployeeDocuments(guard.tenantId, id);
    return NextResponse.json({ success: true, data: docs, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/employees/[id]/documents]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
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

    const { id: employeeId } = await params;
    const formData = await request.formData();

    const file         = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;
    const label        = formData.get("label") as string | null;

    if (!file)         return NextResponse.json({ success: false, data: null, error: "No file provided" }, { status: 400 });
    if (!documentType) return NextResponse.json({ success: false, data: null, error: "documentType is required" }, { status: 400 });
    if (!label)        return NextResponse.json({ success: false, data: null, error: "label is required" }, { status: 400 });

    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json(
        { success: false, data: null, error: "Only PDF, JPG, and PNG files are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, data: null, error: "File exceeds 10 MB limit" },
        { status: 400 }
      );
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const blobPath = `hr/${guard.tenantId}/employees/${employeeId}/${filename}`;

    const blob = await put(blobPath, file, { access: "public", contentType: file.type });

    const doc = await createEmployeeDocument(guard.tenantId, employeeId, {
      fileUrl:      blob.url,
      fileType:     fileType,
      documentType: documentType.toUpperCase(),
      label:        label.trim(),
      fileSize:     file.size,
      uploadedById: (token?.id as string) ?? undefined,
    });

    void logAction({
      organizationId:  guard.tenantId,
      entityType:      "HrEmployeeDocument",
      entityId:        doc.id,
      action:          "CREATE",
      changes:         { label, documentType, fileType },
      performedById:   (token?.id   as string) ?? "",
      performedByName: (token?.name as string) ?? "",
      performedByRole: "admin",
    });

    return NextResponse.json({ success: true, data: doc, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/hr/employees/[id]/documents]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
