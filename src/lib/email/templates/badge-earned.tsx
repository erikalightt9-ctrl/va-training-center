import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface BadgeEarnedEmailProps {
  readonly name: string;
  readonly email: string;
  readonly badgeName: string;
  readonly badgeDescription: string;
  readonly badgeIcon: string;
  readonly dashboardUrl: string;
}

export function BadgeEarnedEmail({
  name,
  badgeName,
  badgeDescription,
  badgeIcon,
  dashboardUrl,
}: BadgeEarnedEmailProps) {
  return (
    <BaseLayout previewText={`You earned a badge: ${badgeName}!`}>
      <Text style={styles.heading}>Badge Earned!</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>You have earned a new badge for your achievements!</Text>
      <Section style={styles.badgeBox}>
        <Text style={styles.badgeIcon}>{badgeIcon}</Text>
        <Text style={styles.badgeName}>{badgeName}</Text>
        <Text style={styles.badgeDesc}>{badgeDescription}</Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={dashboardUrl} style={styles.ctaButton}>View Your Badges</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#d97706", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  badgeBox: { backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "24px", margin: "20px 0" as const, textAlign: "center" as const },
  badgeIcon: { fontSize: "48px", margin: "0 0 8px" as const },
  badgeName: { fontSize: "18px", fontWeight: "bold" as const, color: "#92400e", margin: "0 0 4px" as const },
  badgeDesc: { fontSize: "14px", color: "#78350f", margin: "0" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#d97706", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
