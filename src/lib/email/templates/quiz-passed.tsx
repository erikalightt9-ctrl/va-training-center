import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface QuizPassedEmailProps {
  readonly name: string;
  readonly email: string;
  readonly quizTitle: string;
  readonly courseTitle: string;
  readonly score: number;
  readonly passingScore: number;
  readonly dashboardUrl: string;
}

export function QuizPassedEmail({
  name,
  quizTitle,
  courseTitle,
  score,
  passingScore,
  dashboardUrl,
}: QuizPassedEmailProps) {
  return (
    <BaseLayout previewText={`Quiz passed: ${quizTitle} — ${score}%`}>
      <Text style={styles.heading}>Quiz Passed!</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>
        Congratulations! You passed <strong>{quizTitle}</strong> in{" "}
        <strong>{courseTitle}</strong>.
      </Text>
      <Section style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>Your Score</Text>
        <Text style={styles.scoreValue}>{score}%</Text>
        <Text style={styles.scoreNote}>Passing score: {passingScore}%</Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={dashboardUrl} style={styles.ctaButton}>Continue Learning</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#16a34a", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  scoreBox: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "24px", margin: "20px 0" as const, textAlign: "center" as const },
  scoreLabel: { fontSize: "12px", fontWeight: "bold" as const, color: "#16a34a", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0 0 4px" as const },
  scoreValue: { fontSize: "48px", fontWeight: "bold" as const, color: "#16a34a", margin: "0" as const, lineHeight: "1" },
  scoreNote: { fontSize: "13px", color: "#6b7280", margin: "8px 0 0" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
