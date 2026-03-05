import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface InactivityReminderEmailProps {
  readonly name: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly daysSinceLastActivity: number;
  readonly progressPercent: number;
  readonly dashboardUrl: string;
}

export function InactivityReminderEmail({
  name,
  courseTitle,
  daysSinceLastActivity,
  progressPercent,
  dashboardUrl,
}: InactivityReminderEmailProps) {
  return (
    <BaseLayout previewText={`We miss you! Continue your ${courseTitle} journey`}>
      <Text style={styles.heading}>We Miss You!</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>
        It has been <strong>{daysSinceLastActivity} days</strong> since your last activity
        in <strong>{courseTitle}</strong>. You are <strong>{progressPercent}%</strong> through
        the course — do not lose your momentum!
      </Text>
      <Section style={styles.progressBox}>
        <Text style={styles.progressLabel}>Your Progress</Text>
        <Text style={styles.progressText}>{progressPercent}% complete</Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={dashboardUrl} style={styles.ctaButton}>Resume Learning</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  progressBox: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "20px", margin: "20px 0" as const, textAlign: "center" as const },
  progressLabel: { fontSize: "12px", fontWeight: "bold" as const, color: "#1d4ed8", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0 0 8px" as const },
  progressText: { fontSize: "14px", color: "#6b7280", margin: "8px 0 0" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
