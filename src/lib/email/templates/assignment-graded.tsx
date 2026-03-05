import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface AssignmentGradedEmailProps {
  readonly name: string;
  readonly email: string;
  readonly assignmentTitle: string;
  readonly courseTitle: string;
  readonly grade: number;
  readonly maxPoints: number;
  readonly feedback?: string;
  readonly assignmentUrl: string;
}

export function AssignmentGradedEmail({
  name,
  assignmentTitle,
  courseTitle,
  grade,
  maxPoints,
  feedback,
  assignmentUrl,
}: AssignmentGradedEmailProps) {
  const percentage = Math.round((grade / maxPoints) * 100);

  return (
    <BaseLayout previewText={`Assignment graded: ${assignmentTitle} — ${grade}/${maxPoints}`}>
      <Text style={styles.heading}>Assignment Graded</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>
        Your assignment <strong>{assignmentTitle}</strong> in{" "}
        <strong>{courseTitle}</strong> has been graded.
      </Text>
      <Section style={styles.gradeBox}>
        <Text style={styles.gradeValue}>{grade}/{maxPoints}</Text>
        <Text style={styles.gradePercent}>{percentage}%</Text>
      </Section>
      {feedback && (
        <Section style={styles.feedbackBox}>
          <Text style={styles.feedbackTitle}>Instructor Feedback</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </Section>
      )}
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={assignmentUrl} style={styles.ctaButton}>View Assignment</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  gradeBox: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "24px", margin: "20px 0" as const, textAlign: "center" as const },
  gradeValue: { fontSize: "36px", fontWeight: "bold" as const, color: "#16a34a", margin: "0" as const, lineHeight: "1" },
  gradePercent: { fontSize: "14px", color: "#6b7280", margin: "8px 0 0" as const },
  feedbackBox: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "16px 20px", margin: "20px 0" as const },
  feedbackTitle: { fontSize: "14px", fontWeight: "bold" as const, color: "#1e40af", margin: "0 0 8px" as const },
  feedbackText: { fontSize: "14px", color: "#374151", margin: "0" as const, lineHeight: "1.5" },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
