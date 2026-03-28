import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Auth helper                                                        */
/* ------------------------------------------------------------------ */

async function getAuth(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (
    !token?.id ||
    (token.role !== "corporate" && token.role !== "tenant_admin") ||
    !token.organizationId
  ) return null;
  return { userId: token.id as string, orgId: token.organizationId as string, name: token.name as string | undefined };
}

/* ------------------------------------------------------------------ */
/*  GET — List uploaded files for the organization                    */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const files = await prisma.organizationFile.findMany({
      where: { organizationId: auth.orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        size: true,
        mimeType: true,
        url: true,
        uploadedBy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: files, error: null });
  } catch (err) {
    console.error("[GET /api/corporate/files]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Upload files (stores as URL reference or S3)              */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadedFiles = formData.getAll("file") as File[];

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ success: false, data: null, error: "No files provided" }, { status: 422 });
    }

    // File size limit: 50 MB per file
    const MAX_SIZE = 50 * 1024 * 1024;
    for (const file of uploadedFiles) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, data: null, error: `File "${file.name}" exceeds the 50 MB size limit` },
          { status: 422 },
        );
      }
    }

    // If S3 is configured, upload to S3; otherwise store as a data URL placeholder
    const s3Bucket = process.env.AWS_S3_BUCKET;
    const s3Region = process.env.AWS_REGION ?? "us-east-1";

    const created = await Promise.all(
      uploadedFiles.map(async (file) => {
        let url: string;

        if (s3Bucket) {
          // Upload to S3 via AWS SDK (install @aws-sdk/client-s3 to enable)
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const awsS3 = require("@aws-sdk/client-s3") as any; // eslint-disable-line @typescript-eslint/no-require-imports
            const s3 = new awsS3.S3Client({ region: s3Region });
            const key = `corporate/${auth.orgId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            await s3.send(
              new awsS3.PutObjectCommand({
                Bucket: s3Bucket,
                Key: key,
                Body: buffer,
                ContentType: file.type,
              }),
            );
            url = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;
          } catch (s3Err) {
            console.error("[files/upload] S3 error:", s3Err);
            throw new Error("S3 upload failed");
          }
        } else {
          // Fallback: store file name only (no actual binary storage without S3)
          url = `/api/corporate/files/placeholder?name=${encodeURIComponent(file.name)}`;
        }

        return prisma.organizationFile.create({
          data: {
            organizationId: auth.orgId,
            name: file.name,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
            url,
            uploadedBy: auth.name ?? null,
          },
        });
      }),
    );

    return NextResponse.json({ success: true, data: created, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/corporate/files]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
