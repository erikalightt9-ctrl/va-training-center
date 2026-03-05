import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { unlink } from "fs/promises";
import { join } from "path";
import {
  getResourceById,
  deleteResource,
} from "@/lib/repositories/course-resource.repository";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id || token.role !== "admin") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const resource = await getResourceById(id);
    if (!resource) {
      return NextResponse.json(
        { success: false, data: null, error: "Resource not found" },
        { status: 404 },
      );
    }

    // Attempt to delete the file from the filesystem
    try {
      const absolutePath = join(process.cwd(), "public", resource.filePath);
      await unlink(absolutePath);
    } catch {
      // File may already be missing; log but do not fail
      console.warn(`[DELETE /api/admin/resources/${id}] File not found on disk: ${resource.filePath}`);
    }

    // Delete the database record
    await deleteResource(id);

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/admin/resources/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
