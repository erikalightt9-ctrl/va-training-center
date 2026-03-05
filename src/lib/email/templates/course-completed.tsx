import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface CourseCompletedEmailProps {
  readonly name: string;
  readonly email: string;
  readonly courseTitle: string;
  readonly certNumber: string;
  readonly certificateUrl: string;
}

export function CourseCompletedEmail({
  name,
  courseTitle,
  certNumber,
  certificateUrl,
}: CourseCompletedEmailProps) {
  return (
    <BaseLayout previewText={`Congratulations! You completed ${courseTitle}`}>
      <Text style={styles.heading}>Course Completed!</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>
        Congratulations on completing <strong>{courseTitle}</strong>! Your dedication
        and hard work have paid off. You have earned your certificate of completion.
      </Text>
      <Section style={styles.certBox}>
        <Text style={styles.certLabel}>Certificate Number</Text>
        <Text style={styles.certNumber}>{certNumber}</Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={certificateUrl} style={styles.ctaButton}>View Your Certificate</Link>
      </Section>
      <Text style={styles.textMuted}>
        We are proud of your accomplishment. Best of luck in your VA career!
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#7c3aed", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  textMuted: { fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "24px 0 0" as const },
  certBox: { backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "6px", padding: "24px", margin: "20px 0" as const, textAlign: "center" as const },
  certLabel: { fontSize: "12px", fontWeight: "bold" as const, color: "#7c3aed", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0 0 4px" as const },
  certNumber: { fontSize: "20px", fontWeight: "bold" as const, color: "#374151", fontFamily: "monospace", margin: "0" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#7c3aed", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
