import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface NewEnrollmentAdminEmailProps {
  readonly adminName: string;
  readonly enrolleeName: string;
  readonly enrolleeEmail: string;
  readonly courseTitle: string;
  readonly submittedAt: string;
  readonly enrollmentId: string;
  readonly reviewUrl: string;
}

export function NewEnrollmentAdminEmail({
  adminName,
  enrolleeName,
  enrolleeEmail,
  courseTitle,
  submittedAt,
  reviewUrl,
}: NewEnrollmentAdminEmailProps) {
  return (
    <BaseLayout previewText={`New enrollment: ${enrolleeName} — ${courseTitle}`}>
      <Text style={styles.heading}>New Enrollment Application</Text>
      <Text style={styles.text}>Hi <strong>{adminName}</strong>,</Text>
      <Text style={styles.text}>
        A new enrollment application has been submitted and is awaiting your review.
      </Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Application Summary</Text>
        <Text style={styles.detailRow}>
          <strong>Applicant:</strong> {enrolleeName}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Email:</strong> {enrolleeEmail}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Course:</strong> {courseTitle}
        </Text>
        <Text style={styles.detailRow}>
          <strong>Submitted:</strong> {submittedAt}
        </Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={reviewUrl} style={styles.ctaButton}>
          Review Application
        </Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  detailsBox: { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "16px 20px", margin: "20px 0" as const },
  detailsTitle: { fontSize: "14px", fontWeight: "bold" as const, color: "#374151", margin: "0 0 12px" as const, textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  detailRow: { fontSize: "14px", color: "#4b5563", margin: "4px 0" as const, lineHeight: "1.5" },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
