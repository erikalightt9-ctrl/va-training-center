import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface PaymentReminderEmailProps {
  readonly name: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly amount: string;
  readonly paymentLink: string;
  readonly daysSinceApproval: number;
}

export function PaymentReminderEmail({
  name,
  courseTitle,
  amount,
  paymentLink,
  daysSinceApproval,
}: PaymentReminderEmailProps) {
  return (
    <BaseLayout previewText={`Payment reminder for ${courseTitle}`}>
      <Text style={styles.heading}>Payment Reminder</Text>

      <Text style={styles.text}>
        Hi <strong>{name}</strong>,
      </Text>

      <Text style={styles.text}>
        This is a friendly reminder that your payment for{" "}
        <strong>{courseTitle}</strong> is still pending. Your enrollment was
        approved <strong>{daysSinceApproval} days ago</strong>.
      </Text>

      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}><strong>Course:</strong> {courseTitle}</Text>
        <Text style={styles.detailRow}><strong>Amount Due:</strong> {amount}</Text>
      </Section>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={paymentLink} style={styles.ctaButton}>Complete Payment</Link>
      </Section>

      <Text style={styles.textMuted}>
        If you have already sent your payment, please disregard this email. Your payment may still be processing.
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#d97706", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  textMuted: { fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "24px 0 0" as const },
  detailsBox: { backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "16px 20px", margin: "20px 0" as const },
  detailRow: { fontSize: "14px", color: "#4b5563", margin: "4px 0" as const, lineHeight: "1.5" },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#d97706", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
