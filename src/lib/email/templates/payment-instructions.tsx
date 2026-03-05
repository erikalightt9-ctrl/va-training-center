import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface PaymentInstructionsEmailProps {
  readonly name: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly amount: string;
  readonly referenceCode?: string;
  readonly gcashNumber?: string;
  readonly gcashName?: string;
  readonly gcashQrUrl?: string;
  readonly bankName?: string;
  readonly bankAccountNumber?: string;
  readonly bankAccountName?: string;
  readonly paymentUploadUrl: string;
}

export function PaymentInstructionsEmail({
  name,
  courseTitle,
  amount,
  referenceCode,
  gcashNumber,
  gcashName,
  bankName,
  bankAccountNumber,
  bankAccountName,
  paymentUploadUrl,
}: PaymentInstructionsEmailProps) {
  return (
    <BaseLayout previewText={`Payment instructions for ${courseTitle}`}>
      <Text style={styles.heading}>Payment Instructions</Text>

      <Text style={styles.text}>
        Hi <strong>{name}</strong>,
      </Text>

      <Text style={styles.text}>
        To complete your enrollment in <strong>{courseTitle}</strong>, please
        send your payment of <strong>{amount}</strong> using one of the methods below.
      </Text>

      {referenceCode && (
        <Section style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Your Payment Reference Code</Text>
          <Text style={styles.referenceCode}>{referenceCode}</Text>
          <Text style={styles.referenceNote}>
            Please include this code in your payment reference/note for faster verification.
          </Text>
        </Section>
      )}

      {gcashNumber && (
        <Section style={styles.methodBox}>
          <Text style={styles.methodTitle}>Option 1: GCash</Text>
          <Text style={styles.detailRow}><strong>Number:</strong> {gcashNumber}</Text>
          {gcashName && <Text style={styles.detailRow}><strong>Name:</strong> {gcashName}</Text>}
        </Section>
      )}

      {bankAccountNumber && (
        <Section style={styles.methodBox}>
          <Text style={styles.methodTitle}>{gcashNumber ? "Option 2: Bank Transfer" : "Bank Transfer"}</Text>
          {bankName && <Text style={styles.detailRow}><strong>Bank:</strong> {bankName}</Text>}
          <Text style={styles.detailRow}><strong>Account Number:</strong> {bankAccountNumber}</Text>
          {bankAccountName && <Text style={styles.detailRow}><strong>Account Name:</strong> {bankAccountName}</Text>}
        </Section>
      )}

      <Section style={styles.ctaBox}>
        <Text style={styles.ctaText}>After sending payment, upload your proof of payment:</Text>
        <Link href={paymentUploadUrl} style={styles.ctaButton}>Upload Proof of Payment</Link>
      </Section>

      <Text style={styles.textMuted}>
        Your enrollment will be activated once payment is verified. This usually takes 1-2 business days.
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  textMuted: { fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "24px 0 0" as const },
  referenceBox: { backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "6px", padding: "16px 20px", margin: "16px 0" as const, textAlign: "center" as const },
  referenceLabel: { fontSize: "12px", fontWeight: "bold" as const, color: "#92400e", textTransform: "uppercase" as const, letterSpacing: "0.05em", margin: "0 0 4px" as const },
  referenceCode: { fontSize: "24px", fontWeight: "bold" as const, color: "#78350f", fontFamily: "monospace", letterSpacing: "0.1em", margin: "4px 0" as const },
  referenceNote: { fontSize: "12px", color: "#a16207", margin: "4px 0 0" as const },
  methodBox: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "16px 20px", margin: "16px 0" as const },
  methodTitle: { fontSize: "15px", fontWeight: "bold" as const, color: "#1e40af", margin: "0 0 8px" as const },
  detailRow: { fontSize: "14px", color: "#374151", margin: "4px 0" as const, lineHeight: "1.5" },
  ctaBox: { textAlign: "center" as const, margin: "28px 0" as const },
  ctaText: { fontSize: "15px", color: "#374151", margin: "0 0 12px" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
