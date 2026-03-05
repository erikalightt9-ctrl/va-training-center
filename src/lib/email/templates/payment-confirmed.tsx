import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface PaymentConfirmedEmailProps {
  readonly name: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly amount: string;
  readonly paymentMethod: string;
  readonly temporaryPassword: string;
  readonly loginUrl: string;
}

export function PaymentConfirmedEmail({
  name,
  email,
  courseTitle,
  amount,
  paymentMethod,
  temporaryPassword,
  loginUrl,
}: PaymentConfirmedEmailProps) {
  return (
    <BaseLayout previewText={`Payment confirmed for ${courseTitle}!`}>
      <Text style={styles.heading}>Payment Confirmed!</Text>

      <Text style={styles.text}>
        Hi <strong>{name}</strong>,
      </Text>

      <Text style={styles.text}>
        Your payment for <strong>{courseTitle}</strong> has been confirmed.
        You now have full access to the learning portal!
      </Text>

      <Section style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Payment Receipt</Text>
        <Text style={styles.detailRow}>
          <strong>Course:</strong> {courseTitle}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Amount:</strong> {amount}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Method:</strong> {paymentMethod}
        </Text>
      </Section>

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

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={loginUrl} style={styles.ctaButton}>
          Start Learning Now
        </Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#16a34a", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  warning: { fontSize: "14px", color: "#dc2626", fontWeight: "bold" as const, margin: "12px 0" as const },
  detailsBox: { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "16px 20px", margin: "20px 0" as const },
  detailsTitle: { fontSize: "14px", fontWeight: "bold" as const, color: "#374151", margin: "0 0 12px" as const, textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  detailRow: { fontSize: "14px", color: "#4b5563", margin: "4px 0" as const, lineHeight: "1.5" },
  password: { fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "14px" },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#16a34a", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
