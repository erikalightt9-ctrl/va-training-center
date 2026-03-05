import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface EnrollmentApprovedEmailProps {
  readonly name: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly temporaryPassword: string;
  readonly loginUrl: string;
  readonly paymentLink?: string;
}

export function EnrollmentApprovedEmail({
  name,
  email,
  courseTitle,
  temporaryPassword,
  loginUrl,
  paymentLink,
}: EnrollmentApprovedEmailProps) {
  return (
    <BaseLayout previewText={`Your enrollment for ${courseTitle} has been approved!`}>
      <Text style={styles.heading}>
        {paymentLink ? "Enrollment Approved!" : "Welcome Aboard!"}
      </Text>

      <Text style={styles.text}>
        Hi <strong>{name}</strong>,
      </Text>

      <Text style={styles.text}>
        Great news! Your enrollment application for{" "}
        <strong>{courseTitle}</strong> has been approved.
        {paymentLink
          ? " Please complete your payment to access the learning portal."
          : " You can now access the learning portal with the credentials below."}
      </Text>

      {paymentLink && (
        <Section style={styles.ctaBox}>
          <Text style={styles.ctaText}>Complete your payment to get started:</Text>
          <Link href={paymentLink} style={styles.ctaButton}>
            Complete Payment
          </Link>
        </Section>
      )}

      <Section style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Your Login Credentials</Text>
        <Text style={styles.detailRow}>
          <strong>Email:</strong> {email}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Temporary Password:</strong>{" "}
          <span style={styles.password}>{temporaryPassword}</span>
        </Text>
      </Section>

      <Text style={styles.warning}>
        Important: Please change your password after your first login.
      </Text>

      {!paymentLink && (
        <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
          <Link href={loginUrl} style={styles.ctaButton}>
            Access Learning Portal
          </Link>
        </Section>
      )}

      <Text style={styles.textMuted}>
        If you did not apply for this course, please ignore this email.
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: {
    fontSize: "22px",
    fontWeight: "bold" as const,
    color: "#16a34a",
    margin: "0 0 16px" as const,
  },
  text: {
    fontSize: "15px",
    color: "#374151",
    lineHeight: "1.6",
    margin: "0 0 12px" as const,
  },
  textMuted: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
    margin: "24px 0 0" as const,
  },
  warning: {
    fontSize: "14px",
    color: "#dc2626",
    fontWeight: "bold" as const,
    margin: "12px 0" as const,
  },
  detailsBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "16px 20px",
    margin: "20px 0" as const,
  },
  detailsTitle: {
    fontSize: "14px",
    fontWeight: "bold" as const,
    color: "#374151",
    margin: "0 0 12px" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  detailRow: {
    fontSize: "14px",
    color: "#4b5563",
    margin: "4px 0" as const,
    lineHeight: "1.5",
  },
  password: {
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "14px",
  },
  ctaBox: {
    textAlign: "center" as const,
    margin: "24px 0" as const,
  },
  ctaText: {
    fontSize: "15px",
    color: "#374151",
    margin: "0 0 12px" as const,
  },
  ctaButton: {
    display: "inline-block" as const,
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: "14px 32px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold" as const,
    fontSize: "16px",
  },
} as const;
