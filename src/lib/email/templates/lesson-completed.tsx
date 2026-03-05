import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface LessonCompletedEmailProps {
  readonly name: string;
  readonly email: string;
  readonly lessonTitle: string;
  readonly courseTitle: string;
  readonly nextLessonTitle?: string;
  readonly dashboardUrl: string;
}

export function LessonCompletedEmail({
  name,
  lessonTitle,
  courseTitle,
  nextLessonTitle,
  dashboardUrl,
}: LessonCompletedEmailProps) {
  return (
    <BaseLayout previewText={`Lesson completed: ${lessonTitle}`}>
      <Text style={styles.heading}>Lesson Completed!</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>
        Great job! You have completed <strong>{lessonTitle}</strong> in{" "}
        <strong>{courseTitle}</strong>. Keep up the momentum!
      </Text>
      {nextLessonTitle && (
        <Section style={styles.nextBox}>
          <Text style={styles.nextLabel}>Up Next</Text>
          <Text style={styles.nextTitle}>{nextLessonTitle}</Text>
        </Section>
      )}
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={dashboardUrl} style={styles.ctaButton}>
          {nextLessonTitle ? "Continue Learning" : "Back to Course"}
        </Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#16a34a", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  nextBox: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "16px 20px", margin: "20px 0" as const },
  nextLabel: { fontSize: "12px", fontWeight: "bold" as const, color: "#16a34a", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0 0 4px" as const },
  nextTitle: { fontSize: "16px", fontWeight: "bold" as const, color: "#374151", margin: "0" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
