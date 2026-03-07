"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Download,
  Eye,
  Palette,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  FileText,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WorkEntry {
  readonly id: string;
  readonly company: string;
  readonly position: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly description: string;
}

interface EducationEntry {
  readonly id: string;
  readonly institution: string;
  readonly degree: string;
  readonly year: string;
}

interface CertEntry {
  readonly title: string;
  readonly certNumber: string;
  readonly issuedAt: string;
}

interface ResumeData {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly summary: string;
  readonly workExperience: ReadonlyArray<WorkEntry>;
  readonly education: ReadonlyArray<EducationEntry>;
  readonly skills: ReadonlyArray<string>;
  readonly certifications: ReadonlyArray<CertEntry>;
}

type Template = "professional" | "modern" | "minimal";

interface ResumeBuilderProps {
  readonly initialName: string;
  readonly initialEmail: string;
  readonly initialSkills: ReadonlyArray<string>;
  readonly initialCertifications: ReadonlyArray<CertEntry>;
  readonly courseTitle: string;
}

const STORAGE_KEY = "va-resume-draft";

const TEMPLATES: ReadonlyArray<{
  readonly id: Template;
  readonly label: string;
  readonly accent: string;
  readonly accentBg: string;
  readonly accentLight: string;
}> = [
  {
    id: "professional",
    label: "Professional",
    accent: "text-blue-700",
    accentBg: "bg-blue-700",
    accentLight: "bg-blue-50",
  },
  {
    id: "modern",
    label: "Modern",
    accent: "text-emerald-700",
    accentBg: "bg-emerald-700",
    accentLight: "bg-emerald-50",
  },
  {
    id: "minimal",
    label: "Minimal",
    accent: "text-gray-700",
    accentBg: "bg-gray-700",
    accentLight: "bg-gray-50",
  },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ResumeBuilder({
  initialName,
  initialEmail,
  initialSkills,
  initialCertifications,
  courseTitle,
}: ResumeBuilderProps) {
  const [resume, setResume] = useState<ResumeData>({
    name: initialName,
    email: initialEmail,
    phone: "",
    location: "",
    summary: "",
    workExperience: [],
    education: [],
    skills: [...initialSkills],
    certifications: [...initialCertifications],
  });
  const [template, setTemplate] = useState<Template>("professional");
  const [skillInput, setSkillInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          resume?: ResumeData;
          template?: Template;
        };
        if (parsed.resume) setResume(parsed.resume);
        if (parsed.template) setTemplate(parsed.template);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  /* Persist to localStorage on every change */
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ resume, template }),
      );
    } catch {
      /* storage full — silently ignore */
    }
  }, [resume, template, loaded]);

  /* Immutable updater */
  const updateField = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      setResume((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* Work experience helpers */
  const addWork = useCallback(() => {
    setResume((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          id: generateId(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  }, []);

  const updateWork = useCallback(
    (id: string, field: keyof WorkEntry, value: string) => {
      setResume((prev) => ({
        ...prev,
        workExperience: prev.workExperience.map((w) =>
          w.id === id ? { ...w, [field]: value } : w,
        ),
      }));
    },
    [],
  );

  const removeWork = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((w) => w.id !== id),
    }));
  }, []);

  /* Education helpers */
  const addEducation = useCallback(() => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), institution: "", degree: "", year: "" },
      ],
    }));
  }, []);

  const updateEducation = useCallback(
    (id: string, field: keyof EducationEntry, value: string) => {
      setResume((prev) => ({
        ...prev,
        education: prev.education.map((e) =>
          e.id === id ? { ...e, [field]: value } : e,
        ),
      }));
    },
    [],
  );

  const removeEducation = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  }, []);

  /* Skills helpers */
  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    setResume((prev) => {
      if (prev.skills.includes(trimmed)) return prev;
      return { ...prev, skills: [...prev.skills, trimmed] };
    });
    setSkillInput("");
  }, [skillInput]);

  const removeSkill = useCallback((skill: string) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  }, []);

  const handleSkillKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSkill();
      }
    },
    [addSkill],
  );

  /* Download as PDF via print */
  const handleDownload = useCallback(() => {
    window.print();
  }, []);

  const tpl = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      {/* Print styles — hide everything except the preview */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 2rem !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- LEFT: Form ---- */}
        <div className="space-y-6">
          {/* Template Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Template</h2>
            </div>
            <div className="flex gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    template === t.id
                      ? `${t.accentBg} text-white`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={resume.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={resume.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={resume.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+63 XXX XXX XXXX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={resume.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City, Country"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">
              Professional Summary
            </h2>
            <textarea
              rows={4}
              value={resume.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder={`Dedicated ${courseTitle} professional with strong attention to detail...`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">
                Work Experience
              </h2>
              <button
                onClick={addWork}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            {resume.workExperience.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                No work experience added yet.
              </p>
            )}
            <div className="space-y-4">
              {resume.workExperience.map((w) => (
                <div
                  key={w.id}
                  className="border border-gray-100 rounded-lg p-3 relative"
                >
                  <button
                    onClick={() => removeWork(w.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={w.company}
                      onChange={(e) =>
                        updateWork(w.id, "company", e.target.value)
                      }
                      placeholder="Company"
                      className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={w.position}
                      onChange={(e) =>
                        updateWork(w.id, "position", e.target.value)
                      }
                      placeholder="Position"
                      className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={w.startDate}
                      onChange={(e) =>
                        updateWork(w.id, "startDate", e.target.value)
                      }
                      placeholder="Start (e.g. Jan 2024)"
                      className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={w.endDate}
                      onChange={(e) =>
                        updateWork(w.id, "endDate", e.target.value)
                      }
                      placeholder="End (or Present)"
                      className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={w.description}
                    onChange={(e) =>
                      updateWork(w.id, "description", e.target.value)
                    }
                    placeholder="Key responsibilities and achievements..."
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Education</h2>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            {resume.education.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                No education entries added yet.
              </p>
            )}
            <div className="space-y-3">
              {resume.education.map((e) => (
                <div
                  key={e.id}
                  className="border border-gray-100 rounded-lg p-3 relative"
                >
                  <button
                    onClick={() => removeEducation(e.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={e.institution}
                      onChange={(ev) =>
                        updateEducation(e.id, "institution", ev.target.value)
                      }
                      placeholder="Institution"
                      className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={e.degree}
                      onChange={(ev) =>
                        updateEducation(e.id, "degree", ev.target.value)
                      }
                      placeholder="Degree / Program"
                      className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={e.year}
                      onChange={(ev) =>
                        updateEducation(e.id, "year", ev.target.value)
                      }
                      placeholder="Year"
                      className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {resume.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                >
                  {s}
                  <button
                    onClick={() => removeSkill(s)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Add a skill..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addSkill}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Download Button (mobile) */}
          <div className="lg:hidden">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download as PDF
            </button>
          </div>
        </div>

        {/* ---- RIGHT: Preview ---- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="h-4 w-4" />
              Live Preview
            </div>
            <button
              onClick={handleDownload}
              className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download as PDF
            </button>
          </div>

          <div
            id="resume-preview"
            ref={printRef}
            className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm min-h-[600px]"
          >
            {/* Name & Contact */}
            <div className="text-center mb-6">
              <h1 className={`text-2xl font-bold ${tpl.accent}`}>
                {resume.name || "Your Name"}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs text-gray-500">
                {resume.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {resume.email}
                  </span>
                )}
                {resume.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {resume.phone}
                  </span>
                )}
                {resume.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {resume.location}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {resume.summary && (
              <div className="mb-5">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${tpl.accent} border-b-2 pb-1 mb-2`}
                >
                  Professional Summary
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {resume.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {resume.workExperience.length > 0 && (
              <div className="mb-5">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${tpl.accent} border-b-2 pb-1 mb-2 flex items-center gap-1`}
                >
                  <Briefcase className="h-3 w-3" />
                  Work Experience
                </h2>
                <div className="space-y-3">
                  {resume.workExperience.map((w) => (
                    <div key={w.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {w.position || "Position"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {w.company || "Company"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {w.startDate}
                          {w.endDate ? ` - ${w.endDate}` : ""}
                        </span>
                      </div>
                      {w.description && (
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {w.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <div className="mb-5">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${tpl.accent} border-b-2 pb-1 mb-2 flex items-center gap-1`}
                >
                  <GraduationCap className="h-3 w-3" />
                  Education
                </h2>
                <div className="space-y-2">
                  {resume.education.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {e.degree || "Degree"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {e.institution || "Institution"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {e.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <div className="mb-5">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${tpl.accent} border-b-2 pb-1 mb-2 flex items-center gap-1`}
                >
                  <Wrench className="h-3 w-3" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.map((s) => (
                    <span
                      key={s}
                      className={`${tpl.accentLight} text-gray-700 px-2 py-0.5 rounded text-xs`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {resume.certifications.length > 0 && (
              <div className="mb-5">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${tpl.accent} border-b-2 pb-1 mb-2 flex items-center gap-1`}
                >
                  <Award className="h-3 w-3" />
                  Certifications
                </h2>
                <div className="space-y-1">
                  {resume.certifications.map((c) => (
                    <div key={c.certNumber} className="flex justify-between">
                      <p className="text-sm text-gray-700">{c.title}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(c.issuedAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!resume.summary &&
              resume.workExperience.length === 0 &&
              resume.education.length === 0 &&
              resume.skills.length === 0 &&
              resume.certifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FileText className="h-12 w-12 mb-3" />
                  <p className="text-sm">
                    Fill in the form to see your resume preview
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
