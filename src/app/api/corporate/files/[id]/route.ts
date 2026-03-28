import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

async function getAuth(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (
    !token?.id ||
    (token.role !== "corporate" && token.role !== "tenant_admin") ||
    !token.organizationId
  ) return null;
  return { orgId: token.organizationId as string };
}

/* ------------------------------------------------------------------ */
/*  DELETE — Remove a file record (and optionally the S3 object)     */
/* ------------------------------------------------------------------ */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const file = await prisma.organizationFile.findFirst({
      where: { id, organizationId: auth.orgId },
      select: { id: true, url: true },
    });

    if (!file) {
      return NextResponse.json({ success: false, data: null, error: "File not found" }, { status: 404 });
    }

    // Attempt S3 deletion if configured
    const s3Bucket = process.env.AWS_S3_BUCKET;
    if (s3Bucket && file.url.includes(s3Bucket)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
        const awsS3 = require("@aws-sdk/client-s3") as any;
        const region = process.env.AWS_REGION ?? "us-east-1";
        const s3 = new awsS3.S3Client({ region });
        const fileUrl = new URL(file.url);
        const key = fileUrl.pathname.replace(/^\//, "");
        await s3.send(new awsS3.DeleteObjectCommand({ Bucket: s3Bucket, Key: key }));
      } catch (s3Err) {
        console.warn("[files/delete] S3 deletion failed (continuing):", s3Err);
      }
    }

    await prisma.organizationFile.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/corporate/files/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
