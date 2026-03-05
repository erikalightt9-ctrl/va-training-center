import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface PendingEnrollment {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly hoursWaiting: number;
  readonly submittedAt: string;
}

interface AdminReviewReminderEmailProps {
  readonly adminName: string;
  readonly pendingEnrollments: ReadonlyArray<PendingEnrollment>;
  readonly isUrgent: boolean;
  readonly dashboardUrl: string;
}

export function AdminReviewReminderEmail({
  adminName,
  pendingEnrollments,
  isUrgent,
  dashboardUrl,
}: AdminReviewReminderEmailProps) {
  const count = pendingEnrollments.length;
  const label = count === 1 ? "enrollment" : "enrollments";

  return (
    <BaseLayout
      previewText={
        isUrgent
          ? `URGENT: ${count} ${label} pending over 12h`
          : `${count} pending ${label} to review`
      }
    >
      <Text style={isUrgent ? styles.headingUrgent : styles.heading}>
        {isUrgent ? "Urgent: " : ""}Pending Enrollments
      </Text>
      <Text style={styles.text}>Hi <strong>{adminName}</strong>,</Text>
      <Text style={styles.text}>
        There {count === 1 ? "is" : "are"} <strong>{count}</strong> pending{" "}
        {label} awaiting your review.
      </Text>
      {pendingEnrollments.map((enrollment) => (
        <Section key={enrollment.id} style={styles.enrollmentCard}>
          <Text style={styles.enrollmentName}>{enrollment.fullName}</Text>
          <Text style={styles.enrollmentDetail}>
            {enrollment.email} &bull; {enrollment.courseTitle}
          </Text>
          <Text style={styles.enrollmentDetail}>
            Submitted: {enrollment.submittedAt} ({enrollment.hoursWaiting}h waiting)
          </Text>
        </Section>
      ))}
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={dashboardUrl} style={styles.ctaButton}>Review Enrollments</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0 0 16px" as const },
  headingUrgent: { fontSize: "22px", fontWeight: "bold" as const, color: "#dc2626", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  enrollmentCard: { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px 16px", margin: "8px 0" as const },
  enrollmentName: { fontSize: "15px", fontWeight: "bold" as const, color: "#374151", margin: "0 0 4px" as const },
  enrollmentDetail: { fontSize: "13px", color: "#6b7280", margin: "2px 0" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
