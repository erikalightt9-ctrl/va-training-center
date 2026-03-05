import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function isEmailConfigured(): boolean {
  return Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);
}

/**
 * Creates a nodemailer transporter if Gmail credentials are configured.
 * Returns null when credentials are missing (dev environment without email).
 */
function createTransporter(): nodemailer.Transporter | null {
  if (!isEmailConfigured()) {
    console.warn(
      "[Mailer] GMAIL_USER or GMAIL_APP_PASSWORD not set. " +
        "Emails will be logged to console instead of sent. " +
        "Set these in .env to enable email delivery.",
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

const transporter = createTransporter();

export interface SendMailOptions {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly html: string;
}

/**
 * Sends an email. Falls back to console logging when email is not configured.
 * Throws on actual send failures so callers can handle retries.
 */
export async function sendMail(options: SendMailOptions): Promise<void> {
  if (!transporter) {
    console.log(
      `[Mailer][DEV] Would send email:\n` +
        `  To: ${options.to}\n` +
        `  Subject: ${options.subject}\n` +
        `  From: ${options.from}`,
    );
    return;
  }

  const result = await transporter.sendMail(options);
  console.log(`[Mailer] Email sent to ${options.to} — messageId: ${result.messageId}`);
}

/**
 * Sends an email with automatic retry (1 retry after 2s delay).
 * Logs errors without throwing so callers can fire-and-forget safely.
 */
export async function sendMailWithRetry(
  options: SendMailOptions,
  label: string,
): Promise<boolean> {
  try {
    await sendMail(options);
    return true;
  } catch (err) {
    console.error(`[Mailer] ${label} — first attempt failed:`, err);

    // Retry once after 2 seconds
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await sendMail(options);
      console.log(`[Mailer] ${label} — retry succeeded`);
      return true;
    } catch (retryErr) {
      console.error(`[Mailer] ${label} — retry also failed:`, retryErr);
      return false;
    }
  }
}

/** @deprecated Use sendMail or sendMailWithRetry instead */
export { transporter };
