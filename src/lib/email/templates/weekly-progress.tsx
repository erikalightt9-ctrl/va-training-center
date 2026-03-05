import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface WeeklyProgressEmailProps {
  readonly name: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly progressPercent: number;
  readonly dashboardUrl: string;
}

export function WeeklyProgressEmail({
  name,
  courseTitle,
  completedLessons,
  totalLessons,
  progressPercent,
  dashboardUrl,
}: WeeklyProgressEmailProps) {
  return (
    <BaseLayout previewText={`Weekly progress: ${progressPercent}% complete in ${courseTitle}`}>
      <Text style={styles.heading}>Your Weekly Progress</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>
        Here is your weekly progress update for <strong>{courseTitle}</strong>.
      </Text>
      <Section style={styles.progressBox}>
        <Text style={styles.progressPercent}>{progressPercent}%</Text>
        <Text style={styles.progressLabel}>Complete</Text>
        <Text style={styles.lessonCount}>
          {completedLessons} of {totalLessons} lessons completed
        </Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={dashboardUrl} style={styles.ctaButton}>Continue Learning</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  progressBox: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "24px", margin: "20px 0" as const, textAlign: "center" as const },
  progressPercent: { fontSize: "48px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0" as const, lineHeight: "1" },
  progressLabel: { fontSize: "14px", color: "#6b7280", margin: "4px 0 16px" as const },
  lessonCount: { fontSize: "13px", color: "#6b7280", margin: "12px 0 0" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
