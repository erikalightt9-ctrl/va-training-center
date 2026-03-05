import { Text, Section, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface ForumReplyEmailProps {
  readonly name: string;
  readonly email: string;
  readonly threadTitle: string;
  readonly replierName: string;
  readonly replyPreview: string;
  readonly threadUrl: string;
}

export function ForumReplyEmail({
  name,
  threadTitle,
  replierName,
  replyPreview,
  threadUrl,
}: ForumReplyEmailProps) {
  return (
    <BaseLayout previewText={`${replierName} replied to "${threadTitle}"`}>
      <Text style={styles.heading}>New Forum Reply</Text>
      <Text style={styles.text}>Hi <strong>{name}</strong>,</Text>
      <Text style={styles.text}>
        <strong>{replierName}</strong> replied to your thread{" "}
        <strong>{threadTitle}</strong>.
      </Text>
      <Section style={styles.replyBox}>
        <Text style={styles.replyAuthor}>{replierName} wrote:</Text>
        <Text style={styles.replyContent}>{replyPreview}</Text>
      </Section>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={threadUrl} style={styles.ctaButton}>View Thread</Link>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  heading: { fontSize: "22px", fontWeight: "bold" as const, color: "#1d4ed8", margin: "0 0 16px" as const },
  text: { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" as const },
  replyBox: { backgroundColor: "#f9fafb", borderLeft: "4px solid #1d4ed8", padding: "16px 20px", margin: "20px 0" as const },
  replyAuthor: { fontSize: "13px", fontWeight: "bold" as const, color: "#6b7280", margin: "0 0 8px" as const },
  replyContent: { fontSize: "14px", color: "#374151", margin: "0" as const, lineHeight: "1.5", fontStyle: "italic" as const },
  ctaButton: { display: "inline-block" as const, backgroundColor: "#1d4ed8", color: "#ffffff", padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" as const, fontSize: "16px" },
} as const;
