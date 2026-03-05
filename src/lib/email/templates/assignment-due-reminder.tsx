import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface AssignmentDueReminderEmailProps {
  readonly name: string;
  readonly email: string;
  readonly assignmentTitle: string;
  readonly courseTitle: string;
  readonly dueDate: string;
  readonly assignmentUrl: string;
}

export function AssignmentDueReminderEmail({
  name,
  assignmentTitle,
  courseTitle,
  dueDate,
  assignmentUrl,
}: AssignmentDueReminderEmailProps) {
  return (
    <BaseLayout previewText={`Assignment due: ${assignmentTitle} — ${dueDate}`}>
      <Text style={styles.heading}>Assignment Due Soon</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>This is a reminder that your assignment is due soon.</Text>
      <Section style={styles.detailsBox}>
        <Text style={styles.detailRow}><strong>Assignment:</strong> {assignmentTitle}</Text>
        <Text style={styles.detailRow}><strong>Course:</strong> {courseTitle}</Text>
        <Text style={styles.detailRow}><strong>Due Date:</strong> {dueDate}</Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={assignmentUrl} style={styles.ctaButton}>Submit Assignment</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#d97706", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  detailsBox: { backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "16px 20px", margin: "20px 0" as const },
  detailRow: { fontSize: "14px", color: "#4b5563", margin: "4px 0" as const, lineHeight: "1.5" },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
