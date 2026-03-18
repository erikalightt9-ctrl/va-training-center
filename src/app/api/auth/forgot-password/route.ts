import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/services/password-reset.service";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";

const schema = z.object({
  email: z.string().email("Invalid email address."),
  userType: z.enum(["student", "admin", "trainer", "manager"]),
  tenantId: z.string().optional(),
});

// Generic success message — never reveal if email exists
const GENERIC_OK = {
  success: true,
  data: { message: "If that email exists, a reset link has been sent." },
  error: null,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.issues[0].message },
        { status: 422 },
      );
    }

    const { email, userType, tenantId } = result.data;

    const outcome = await requestPasswordReset(email, userType, tenantId);

    if (!outcome.success) {
      console.error("[POST /api/auth/forgot-password] invalid userType");
      return NextResponse.json(GENERIC_OK);
    }

    // Send reset email only when the user was found (token is non-empty)
    if (outcome.token) {
      const appUrl =
        process.env.APP_URL ??
        process.env.NEXTAUTH_URL ??
        "https://cranky-blackburn.vercel.app";
      const resetLink = `${appUrl}/reset-password?token=${outcome.token}&type=${userType}`;

      // Fire-and-forget — don't block the response on email delivery
      sendPasswordResetEmail({ email, resetLink, userType }).catch((err) => {
        console.error("[forgot-password] email send failed:", err);
      });
    }

    return NextResponse.json(GENERIC_OK);
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
