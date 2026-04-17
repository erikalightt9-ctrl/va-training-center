"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ArrowLeft, AlertCircle, CheckCircle, Pencil, Save, X,
  Download, FileText, Trash2, Upload, Eye, FileUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Contract   { id: string; basicSalary: number; contractType: string; startDate: string; isCurrent: boolean }
interface DocFile    { id: string; fileUrl: string; fileType: string; documentType: string; label: string; fileSize: number | null; createdAt: string }
interface AuditEntry { id: string; action: string; changes: Record<string, unknown>; performedByName: string; createdAt: string }

interface Employee {
  id: string; employeeNumber: string;
  firstName: string; lastName: string; middleName: string | null;
  email: string; phone: string | null;
  birthDate: string | null; gender: string | null; civilStatus: string | null;
  nationality: string | null;
  presentAddress: string | null; permanentAddress: string | null; address: string | null;
  position: string; department: string | null;
  employmentType: string; status: string;
  hireDate: string; regularizationDate: string | null;
  separationDate: string | null; separationReason: string | null;
  lastWorkingDate: string | null; remarks: string | null;
  sssNumber: string | null; philhealthNumber: string | null;
  pagibigNumber: string | null; tinNumber: string | null;
  emergencyContact: string | null; emergencyRelationship: string | null; emergencyPhone: string | null;
  allowance: number | null; payrollType: string | null;
  contracts: Contract[];
  documents: DocFile[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const F = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const L = "block text-xs font-medium text-slate-500 mb-1";

type Tab = "profile" | "employment" | "govids" | "compensation" | "documents" | "audit";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile",      label: "Profile"      },
  { id: "employment",   label: "Employment"   },
  { id: "govids",       label: "Gov't IDs"    },
  { id: "compensation", label: "Compensation" },
  { id: "documents",    label: "Documents"    },
  { id: "audit",        label: "Audit Log"    },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:       "bg-green-100 text-green-700",
  ON_LEAVE:     "bg-amber-100 text-amber-700",
  INACTIVE:     "bg-slate-100 text-slate-500",
  RESIGNED:     "bg-red-100 text-red-600",
  TERMINATED:   "bg-red-100 text-red-800",
  PROBATIONARY: "bg-blue-100 text-blue-700",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  ID: "ID", RESUME: "Résumé", CONTRACT: "Contract",
  CERTIFICATE: "Certificate", OTHER: "Other",
};

const fmtDate  = (d: string | null) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—";
const peso     = (n: number | null) => n != null ? `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "₱0.00";
const blank    = (v: string | null | undefined) => v || "—";
const kb       = (n: number | null) => n ? `${(n / 1024).toFixed(1)} KB` : "";
const isoDate  = (s: string | null) => s ? s.split("T")[0] : "";

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [emp, setEmp]         = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<Tab>("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveOk, setSaveOk]   = useState(false);
  const [form, setForm]       = useState<Partial<Employee>>({});
  const [audit, setAudit]     = useState<AuditEntry[]>([]);
  const [auditLoaded, setAuditLoaded] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  // Document upload state
  const fileRef                  = useRef<HTMLInputElement>(null);
  const [docLabel, setDocLabel]   = useState("");
  const [docType, setDocType]     = useState("ID");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  /* ── Load employee ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/hr/employees/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setEmp(json.data);
      setForm(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* ── Load audit log when tab opened ── */
  useEffect(() => {
    if (tab !== "audit" || auditLoaded) return;
    setAuditLoading(true);
    fetch(`/api/admin/accounting/audit?entityType=HrEmployee&entityId=${id}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setAudit(j.data ?? []); setAuditLoaded(true); })
      .finally(() => setAuditLoading(false));
  }, [tab, id, auditLoaded]);

  /* ── Save edits ── */
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        firstName:             form.firstName,
        lastName:              form.lastName,
        middleName:            form.middleName || undefined,
        phone:                 form.phone      || undefined,
        position:              form.position,
        department:            form.department || undefined,
        employmentType:        form.employmentType,
        status:                form.status,
        nationality:           form.nationality    || undefined,
        presentAddress:        form.presentAddress || undefined,
        permanentAddress:      form.permanentAddress || undefined,
        birthDate:             form.birthDate ? isoDate(form.birthDate) : undefined,
        gender:                form.gender         || undefined,
        civilStatus:           form.civilStatus    || undefined,
        sssNumber:             form.sssNumber      || undefined,
        philhealthNumber:      form.philhealthNumber || undefined,
        pagibigNumber:         form.pagibigNumber  || undefined,
        tinNumber:             form.tinNumber      || undefined,
        emergencyContact:      form.emergencyContact || undefined,
        emergencyRelationship: form.emergencyRelationship || undefined,
        emergencyPhone:        form.emergencyPhone || undefined,
        allowance:             form.allowance != null ? Number(form.allowance) : undefined,
        payrollType:           form.payrollType    || undefined,
        remarks:               form.remarks        || undefined,
        separationDate:        form.separationDate ? isoDate(form.separationDate) : undefined,
        separationReason:      form.separationReason || undefined,
        lastWorkingDate:       form.lastWorkingDate ? isoDate(form.lastWorkingDate) : undefined,
        regularizationDate:    form.regularizationDate ? isoDate(form.regularizationDate) : undefined,
      };

      const res  = await fetch(`/api/admin/hr/employees/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setEmp((prev) => ({ ...prev!, ...json.data }));
      setForm((prev) => ({ ...prev, ...json.data }));
      setEditing(false);
      setSaveOk(true);
      setAuditLoaded(false); // reset so audit refreshes next open
      setTimeout(() => setSaveOk(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete document ── */
  const deleteDoc = async (docId: string) => {
    if (!confirm("Remove this document from the 201 file?")) return;
    const res = await fetch(`/api/admin/hr/employees/${id}/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      setEmp((p) => p ? { ...p, documents: p.documents.filter((d) => d.id !== docId) } : p);
    }
  };

  /* ── Upload document ── */
  const uploadDoc = async (file: File) => {
    if (!docLabel.trim()) { setUploadErr("Please enter a document label first."); return; }
    setUploading(true);
    setUploadErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", docType);
      fd.append("label", docLabel.trim());
      const res  = await fetch(`/api/admin/hr/employees/${id}/documents`, { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setEmp((p) => p ? { ...p, documents: [json.data, ...p.documents] } : p);
      setDocLabel("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const ff = (k: keyof Employee) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  /* ── States ── */
  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
  if (!emp) return (
    <div className="p-6">
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
        <AlertCircle className="h-5 w-5" />{error ?? "Employee not found"}
      </div>
    </div>
  );

  const salary   = emp.contracts[0]?.basicSalary ?? 0;
  const fullName = `${emp.lastName}, ${emp.firstName}${emp.middleName ? ` ${emp.middleName[0]}.` : ""}`;

  return (
    <div className="p-6 space-y-5 max-w-4xl">

      {/* ─── Header ─── */}
      <div>
        <Link href="/admin/hr/employees" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[emp.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {emp.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{emp.position}{emp.department ? ` · ${emp.department}` : ""}</p>
              <p className="text-xs text-slate-400 mt-1">#{emp.employeeNumber} · {emp.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {saveOk && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" /> Saved
                </span>
              )}
              {error && (
                <span className="text-red-600 text-xs">{error}</span>
              )}
              <a href={`/api/admin/hr/employees/${id}/export201`}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                <FileText className="h-4 w-4" /> Export 201 PDF
              </a>
              {editing ? (
                <>
                  <button onClick={save} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                  </button>
                  <button onClick={() => { setEditing(false); setForm(emp); setError(null); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 font-medium">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition ${
              tab === t.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
            {t.id === "documents" && emp.documents.length > 0 && (
              <span className="ml-1 bg-indigo-600 text-white text-[10px] rounded-full px-1.5">{emp.documents.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab panels ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

        {/* ── Profile ── */}
        {tab === "profile" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div><label className={L}>First Name</label>
                {editing ? <input className={F} value={form.firstName ?? ""} onChange={ff("firstName")} /> : <p className="text-sm">{blank(emp.firstName)}</p>}</div>
              <div><label className={L}>Last Name</label>
                {editing ? <input className={F} value={form.lastName ?? ""} onChange={ff("lastName")} /> : <p className="text-sm">{blank(emp.lastName)}</p>}</div>
              <div><label className={L}>Middle Name</label>
                {editing ? <input className={F} value={form.middleName ?? ""} onChange={ff("middleName")} /> : <p className="text-sm">{blank(emp.middleName)}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={L}>Email</label><p className="text-sm">{emp.email}</p></div>
              <div><label className={L}>Phone</label>
                {editing ? <input className={F} value={form.phone ?? ""} onChange={ff("phone")} /> : <p className="text-sm">{blank(emp.phone)}</p>}</div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className={L}>Birth Date</label>
                {editing ? <input type="date" className={F} value={isoDate(form.birthDate ?? null)} onChange={ff("birthDate")} /> : <p className="text-sm">{fmtDate(emp.birthDate)}</p>}</div>
              <div><label className={L}>Gender</label>
                {editing ? <select className={F} value={form.gender ?? ""} onChange={ff("gender")}><option value="">—</option><option>Male</option><option>Female</option></select>
                         : <p className="text-sm">{blank(emp.gender)}</p>}</div>
              <div><label className={L}>Civil Status</label>
                {editing ? <select className={F} value={form.civilStatus ?? ""} onChange={ff("civilStatus")}>
                    <option value="">—</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                  </select> : <p className="text-sm">{blank(emp.civilStatus)}</p>}</div>
              <div><label className={L}>Nationality</label>
                {editing ? <input className={F} value={form.nationality ?? ""} onChange={ff("nationality")} /> : <p className="text-sm">{blank(emp.nationality)}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={L}>Present Address</label>
                {editing ? <textarea className={F} rows={2} value={form.presentAddress ?? ""} onChange={ff("presentAddress")} />
                         : <p className="text-sm whitespace-pre-wrap">{blank(emp.presentAddress ?? emp.address)}</p>}</div>
              <div><label className={L}>Permanent Address</label>
                {editing ? <textarea className={F} rows={2} value={form.permanentAddress ?? ""} onChange={ff("permanentAddress")} />
                         : <p className="text-sm whitespace-pre-wrap">{blank(emp.permanentAddress)}</p>}</div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={L}>Name</label>
                  {editing ? <input className={F} value={form.emergencyContact ?? ""} onChange={ff("emergencyContact")} /> : <p className="text-sm">{blank(emp.emergencyContact)}</p>}</div>
                <div><label className={L}>Relationship</label>
                  {editing ? <select className={F} value={form.emergencyRelationship ?? ""} onChange={ff("emergencyRelationship")}>
                      <option value="">—</option><option>Spouse</option><option>Parent</option><option>Sibling</option>
                      <option>Child</option><option>Relative</option><option>Friend</option><option>Other</option>
                    </select> : <p className="text-sm">{blank(emp.emergencyRelationship)}</p>}</div>
                <div><label className={L}>Contact Number</label>
                  {editing ? <input className={F} value={form.emergencyPhone ?? ""} onChange={ff("emergencyPhone")} /> : <p className="text-sm">{blank(emp.emergencyPhone)}</p>}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Employment ── */}
        {tab === "employment" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={L}>Position</label>
                {editing ? <input className={F} value={form.position ?? ""} onChange={ff("position")} /> : <p className="text-sm">{blank(emp.position)}</p>}</div>
              <div><label className={L}>Department</label>
                {editing ? <select className={F} value={form.department ?? ""} onChange={ff("department")}>
                    <option value="">—</option>
                    <option>Administration</option><option>Human Resources</option><option>Finance & Payroll</option><option>Operations</option>
                    <option>Sales & Marketing</option><option>IT & Systems</option><option>Logistics & Procurement</option>
                  </select> : <p className="text-sm">{blank(emp.department)}</p>}</div>
              <div><label className={L}>Employment Type</label>
                {editing ? <select className={F} value={form.employmentType ?? ""} onChange={ff("employmentType")}>
                    <option value="REGULAR">Regular</option><option value="PROBATIONARY">Probationary</option>
                    <option value="CONTRACTUAL">Contractual</option><option value="PART_TIME">Part-Time</option><option value="INTERN">Intern</option>
                  </select> : <p className="text-sm">{emp.employmentType.replace("_"," ")}</p>}</div>
              <div><label className={L}>Status</label>
                {editing ? <select className={F} value={form.status ?? ""} onChange={ff("status")}>
                    <option value="ACTIVE">Active</option><option value="PROBATIONARY">Probationary</option>
                    <option value="ON_LEAVE">On Leave</option><option value="INACTIVE">Inactive</option>
                    <option value="RESIGNED">Resigned</option><option value="TERMINATED">Terminated</option>
                  </select>
                  : <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[emp.status] ?? ""}`}>{emp.status.replace("_"," ")}</span>}</div>
              <div><label className={L}>Hire Date</label><p className="text-sm">{fmtDate(emp.hireDate)}</p></div>
              <div><label className={L}>Regularization Date</label>
                {editing ? <input type="date" className={F} value={isoDate(form.regularizationDate ?? null)} onChange={ff("regularizationDate")} />
                         : <p className="text-sm">{fmtDate(emp.regularizationDate)}</p>}</div>
            </div>

            {/* Separation fields */}
            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
              <div><label className={L}>Separation Date</label>
                {editing ? <input type="date" className={F} value={isoDate(form.separationDate ?? null)} onChange={ff("separationDate")} />
                         : <p className="text-sm">{fmtDate(emp.separationDate)}</p>}</div>
              <div><label className={L}>Last Working Date</label>
                {editing ? <input type="date" className={F} value={isoDate(form.lastWorkingDate ?? null)} onChange={ff("lastWorkingDate")} />
                         : <p className="text-sm">{fmtDate(emp.lastWorkingDate)}</p>}</div>
              <div className="col-span-2"><label className={L}>Separation Reason</label>
                {editing ? <input className={F} value={form.separationReason ?? ""} onChange={ff("separationReason")} />
                         : <p className="text-sm">{blank(emp.separationReason)}</p>}</div>
            </div>

            <div><label className={L}>Remarks / Notes</label>
              {editing ? <textarea className={F} rows={3} value={form.remarks ?? ""} onChange={ff("remarks")} />
                       : <p className="text-sm whitespace-pre-wrap">{blank(emp.remarks)}</p>}</div>
          </div>
        )}

        {/* ── Gov't IDs ── */}
        {tab === "govids" && (
          <div className="grid grid-cols-2 gap-5">
            {([
              { key: "sssNumber"        as keyof Employee, label: "SSS Number",       ph: "XX-XXXXXXX-X" },
              { key: "philhealthNumber" as keyof Employee, label: "PhilHealth Number", ph: "XX-XXXXXXXXX-X" },
              { key: "pagibigNumber"    as keyof Employee, label: "Pag-IBIG (HDMF)",  ph: "XXXX-XXXX-XXXX" },
              { key: "tinNumber"        as keyof Employee, label: "TIN",               ph: "XXX-XXX-XXX-XXX" },
            ]).map(({ key, label, ph }) => (
              <div key={key as string} className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wide">{label}</label>
                {editing
                  ? <input className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={ph} value={(form[key] as string) ?? ""} onChange={ff(key)} />
                  : <p className="text-base font-mono font-semibold text-slate-800 tracking-wider">{blank(emp[key] as string)}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ── Compensation ── */}
        {tab === "compensation" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wide">Basic Salary</p>
                <p className="text-2xl font-bold text-green-800">{peso(salary)}</p>
                <p className="text-xs text-green-600 mt-1">Monthly · Current Contract</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Allowance</p>
                {editing
                  ? <input type="number" min="0" className={F} value={form.allowance ?? ""} onChange={ff("allowance")} />
                  : <p className="text-2xl font-bold text-blue-800">{peso(emp.allowance)}</p>}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Payroll Type</p>
                {editing
                  ? <select className={F} value={form.payrollType ?? "MONTHLY"} onChange={ff("payrollType")}>
                      <option value="MONTHLY">Monthly</option>
                      <option value="SEMI_MONTHLY">Semi-Monthly</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  : <p className="text-lg font-bold text-slate-700">{(emp.payrollType ?? "MONTHLY").replace("_","-")}</p>}
              </div>
            </div>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
              Government contributions (SSS, PhilHealth, Pag-IBIG) are auto-calculated per payroll run using the configured contribution tables.
              To set per-employee overrides, visit <Link href="/admin/hr/payroll" className="text-indigo-600 hover:underline">Payroll → Payroll Defaults</Link>.
            </p>
          </div>
        )}

        {/* ── Documents ── */}
        {tab === "documents" && (
          <div className="space-y-5">
            {/* Upload form */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50 hover:border-indigo-300 transition-colors">
              <div className="flex items-center gap-2 text-slate-500">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-semibold">Attach Document</span>
              </div>
              {uploadErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />{uploadErr}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className={L}>Label</label>
                  <input className={F} value={docLabel} onChange={(e) => setDocLabel(e.target.value)}
                    placeholder='e.g. "SSS ID", "NBI Clearance"' />
                </div>
                <div>
                  <label className={L}>Document Type</label>
                  <select className={F} value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="ID">ID</option>
                    <option value="RESUME">Résumé / CV</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center justify-center gap-2 w-full border border-indigo-300 bg-indigo-50 text-indigo-700 rounded-xl px-4 py-2 text-sm cursor-pointer hover:bg-indigo-100 transition font-medium">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Choose File"}
                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); }} />
                  </label>
                </div>
              </div>
              <p className="text-xs text-slate-400">Accepted: PDF, JPG, PNG · Max 10 MB · Stored in secure per-tenant cloud storage</p>
            </div>

            {/* Document list */}
            {emp.documents.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No documents in this 201 file yet</p>
                <p className="text-xs text-slate-300 mt-1">Upload employee IDs, resume, contract, certificates above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {emp.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 group transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        doc.fileType === "PDF" ? "bg-red-100 text-red-600"
                          : doc.fileType === "PNG" ? "bg-purple-100 text-purple-600"
                          : "bg-amber-100 text-amber-600"
                      }`}>{doc.fileType}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{doc.label}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                          {doc.fileSize ? ` · ${kb(doc.fileSize)}` : ""}
                          {" · "}{new Date(doc.createdAt).toLocaleDateString("en-PH")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-4">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition" title="Preview">
                        <Eye className="h-4 w-4" />
                      </a>
                      <a href={doc.fileUrl} download
                        className="p-1.5 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition" title="Download">
                        <Download className="h-4 w-4" />
                      </a>
                      <button onClick={() => deleteDoc(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition" title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Audit Log ── */}
        {tab === "audit" && (
          <div className="space-y-3">
            {auditLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : audit.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400">No audit log entries for this employee yet</p>
              </div>
            ) : (
              audit.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    entry.action === "CREATE" ? "bg-green-500"
                      : entry.action === "DELETE" ? "bg-red-500"
                      : "bg-amber-500"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-medium text-slate-700">{entry.action}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(entry.createdAt).toLocaleString("en-PH")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">by {entry.performedByName || "System"}</p>
                    {entry.changes && Object.keys(entry.changes).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.keys(entry.changes).map((k) => (
                          <span key={k} className="px-1.5 py-0.5 bg-slate-100 rounded-md text-xs text-slate-500">{k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
