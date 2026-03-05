import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentCertificates } from "@/lib/repositories/certificate.repository";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  const studentId = (session?.user as { id: string } | undefined)?.id;
  if (!studentId) redirect("/student/login");

  const certificates = await getStudentCertificates(studentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-500 text-sm mt-1">Download your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-5xl mb-4">{"\uD83C\uDF93"}</div>
          <p className="text-gray-500">Complete all lessons in a course to earn a certificate!</p>
        </div>
      ) : (
        certificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{"\uD83C\uDF93"}</span>
                <h3 className="font-semibold text-gray-800">{cert.course.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-xs text-gray-400">Cert #{cert.certNumber}</p>
            </div>
            <a href={`/api/student/certificates/${cert.certNumber}/download`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Download PDF
            </a>
          </div>
        ))
      )}
    </div>
  );
}
