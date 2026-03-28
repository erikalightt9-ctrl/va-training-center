import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentCertificates } from "@/lib/repositories/certificate.repository";
import { Award, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  const studentId = (session?.user as { id: string } | undefined)?.id;
  if (!studentId) redirect("/student/login");

  const certificates = await getStudentCertificates(studentId);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-ds-text">My Certificates</h1>
        <p className="text-ds-muted text-sm mt-0.5">Download your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-ds-card rounded-xl border border-ds-border p-10 text-center">
          <Award className="h-12 w-12 text-ds-muted/30 mx-auto mb-3" />
          <p className="text-ds-muted font-medium">No certificates yet</p>
          <p className="text-xs text-ds-muted/60 mt-1">
            Complete all lessons in a course to earn a certificate!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-ds-card rounded-xl border border-ds-border p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ds-text truncate">{cert.course.title}</h3>
                  <p className="text-xs text-ds-muted mt-0.5">
                    Issued{" "}
                    {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-ds-muted/60">Cert #{cert.certNumber}</p>
                </div>
              </div>
              <a
                href={`/api/student/certificates/${cert.certNumber}/download`}
                className="flex items-center gap-2 bg-ds-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
