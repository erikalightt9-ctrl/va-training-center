"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ArrowLeft, AlertCircle, Eye, EyeOff,
  User, Briefcase, CreditCard, PhoneCall, DollarSign,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const F = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const L = "block text-xs font-medium text-slate-500 mb-1";

/* ------------------------------------------------------------------ */
/*  Tabs                                                                */
/* ------------------------------------------------------------------ */

type Tab = "personal" | "employment" | "govids" | "compensation" | "emergency";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "personal",     label: "Personal",     icon: <User       className="h-3.5 w-3.5" /> },
  { id: "employment",   label: "Employment",   icon: <Briefcase  className="h-3.5 w-3.5" /> },
  { id: "govids",       label: "Gov't IDs",    icon: <CreditCard className="h-3.5 w-3.5" /> },
  { id: "compensation", label: "Compensation", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { id: "emergency",    label: "Emergency",    icon: <PhoneCall  className="h-3.5 w-3.5" /> },
];

/* ------------------------------------------------------------------ */
/*  Default form state                                                  */
/* ------------------------------------------------------------------ */

const DEFAULT = {
  firstName: "", lastName: "", middleName: "",
  email: "", phone: "",
  birthDate: "", gender: "", civilStatus: "", nationality: "Filipino",
  presentAddress: "", permanentAddress: "",
  // Employment
  position: "", department: "",
  employmentType: "REGULAR",
  hireDate: new Date().toISOString().split("T")[0],
  regularizationDate: "",
  remarks: "",
  // Gov IDs
  sssNumber: "", philhealthNumber: "", pagibigNumber: "", tinNumber: "",
  // Compensation
  basicSalary: "", allowance: "", payrollType: "MONTHLY",
  // Emergency
  emergencyContact: "", emergencyRelationship: "", emergencyPhone: "",
  // Portal
  isPortalEnabled: false, portalRole: "EMPLOYEE", tempPassword: "",
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function NewEmployeePage() {
  const router = useRouter();
  const [tab, setTab]         = useState<Tab>("personal");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState(DEFAULT);
  const [showPass, setShowPass] = useState(false);

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.position || !form.hireDate || !form.basicSalary) {
      setError("Please fill in all required fields: first name, last name, email, position, hire date, and basic salary.");
      setTab("personal");
      return;
    }
    if (form.isPortalEnabled && !form.tempPassword) {
      setError("A temporary password is required when portal access is enabled.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        ...form,
        basicSalary: parseFloat(form.basicSalary),
        allowance:   form.allowance ? parseFloat(form.allowance) : undefined,
        tempPassword: form.isPortalEnabled ? form.tempPassword : undefined,
      };
      // Remove empty optional dates
      if (!body.regularizationDate) delete body.regularizationDate;
      if (!body.birthDate)           delete body.birthDate;

      const res  = await fetch("/api/admin/hr/employees", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.push(`/admin/hr/employees/${json.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/hr/employees" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add Employee</h1>
          <p className="text-sm text-slate-500">Create a new Employee 201 file</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
              tab === t.id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── Personal Information ─── */}
      {tab === "personal" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Personal Information</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={L}>First Name *</label><input className={F} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
            <div><label className={L}>Last Name *</label><input className={F} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
            <div><label className={L}>Middle Name</label><input className={F} value={form.middleName} onChange={(e) => set("middleName", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={L}>Email *</label><input type="email" className={F} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><label className={L}>Phone</label><input className={F} placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div><label className={L}>Birth Date</label><input type="date" className={F} value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} /></div>
            <div>
              <label className={L}>Gender</label>
              <select className={F} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">—</option>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div>
              <label className={L}>Civil Status</label>
              <select className={F} value={form.civilStatus} onChange={(e) => set("civilStatus", e.target.value)}>
                <option value="">—</option>
                <option>Single</option><option>Married</option>
                <option>Widowed</option><option>Separated</option>
              </select>
            </div>
            <div><label className={L}>Nationality</label><input className={F} value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></div>
          </div>
          <div>
            <label className={L}>Present Address</label>
            <textarea className={F} rows={2} value={form.presentAddress} onChange={(e) => set("presentAddress", e.target.value)} />
          </div>
          <div>
            <label className={L}>Permanent Address <span className="text-slate-400 font-normal">(if different from present)</span></label>
            <textarea className={F} rows={2} value={form.permanentAddress} onChange={(e) => set("permanentAddress", e.target.value)} />
          </div>
        </div>
      )}

      {/* ─── Employment Details ─── */}
      {tab === "employment" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Employment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={L}>Position *</label><input className={F} value={form.position} onChange={(e) => set("position", e.target.value)} /></div>
            <div>
              <label className={L}>Department</label>
              <select className={F} value={form.department} onChange={(e) => set("department", e.target.value)}>
                <option value="">— Select —</option>
                <option>Administration</option>
                <option>Human Resources</option>
                <option>Finance & Payroll</option>
                <option>Operations</option>
                <option>Sales & Marketing</option>
                <option>IT & Systems</option>
                <option>Logistics & Procurement</option>
              </select>
            </div>
            <div>
              <label className={L}>Employment Type</label>
              <select className={F} value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
                <option value="REGULAR">Regular</option>
                <option value="PROBATIONARY">Probationary</option>
                <option value="CONTRACTUAL">Contractual</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            <div><label className={L}>Hire Date *</label><input type="date" className={F} value={form.hireDate} onChange={(e) => set("hireDate", e.target.value)} /></div>
            <div><label className={L}>Regularization Date</label><input type="date" className={F} value={form.regularizationDate} onChange={(e) => set("regularizationDate", e.target.value)} /></div>
          </div>
          <div>
            <label className={L}>Remarks</label>
            <textarea className={F} rows={3} placeholder="Notes, special conditions…" value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
          </div>

          {/* Portal Access */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Employee Portal Access</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPortalEnabled} onChange={(e) => set("isPortalEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
              <span className="text-sm text-slate-700">Enable employee self-service portal</span>
            </label>
            {form.isPortalEnabled && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className={L}>Portal Role</label>
                  <select className={F} value={form.portalRole} onChange={(e) => set("portalRole", e.target.value)}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="DRIVER">Driver</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <div>
                  <label className={L}>Temporary Password *</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} className={F + " pr-10"} value={form.tempPassword}
                      placeholder="Employee changes on first login" onChange={(e) => set("tempPassword", e.target.value)} />
                    <button type="button" onClick={() => setShowPass((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Government IDs ─── */}
      {tab === "govids" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Government IDs <span className="text-xs font-normal text-slate-400">PH Compliance</span></h2>
          <div className="grid grid-cols-2 gap-5">
            {([
              { key: "sssNumber",       label: "SSS Number",         ph: "XX-XXXXXXX-X" },
              { key: "philhealthNumber", label: "PhilHealth Number", ph: "XX-XXXXXXXXX-X" },
              { key: "pagibigNumber",   label: "Pag-IBIG (HDMF)",   ph: "XXXX-XXXX-XXXX" },
              { key: "tinNumber",       label: "TIN",                ph: "XXX-XXX-XXX-XXX" },
            ] as const).map(({ key, label, ph }) => (
              <div key={key} className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <label className="block text-xs font-bold text-indigo-700 mb-1.5 uppercase tracking-wide">{label}</label>
                <input className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={ph} value={form[key]} onChange={(e) => set(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Compensation ─── */}
      {tab === "compensation" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Compensation</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={L}>Basic Monthly Salary (₱) *</label>
              <input type="number" min="0" className={F} placeholder="0.00" value={form.basicSalary} onChange={(e) => set("basicSalary", e.target.value)} />
            </div>
            <div>
              <label className={L}>Allowance (₱)</label>
              <input type="number" min="0" className={F} placeholder="0.00" value={form.allowance} onChange={(e) => set("allowance", e.target.value)} />
            </div>
            <div>
              <label className={L}>Payroll Type</label>
              <select className={F} value={form.payrollType} onChange={(e) => set("payrollType", e.target.value)}>
                <option value="MONTHLY">Monthly</option>
                <option value="SEMI_MONTHLY">Semi-Monthly (1st & 15th)</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Note:</strong> Government contributions (SSS, PhilHealth, Pag-IBIG) will be automatically calculated based on the salary and the contribution rules configured under <em>Gov't Contribution Rules</em>.
          </div>
        </div>
      )}

      {/* ─── Emergency Contact ─── */}
      {tab === "emergency" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Emergency Contact</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={L}>Contact Name</label><input className={F} value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} /></div>
            <div>
              <label className={L}>Relationship</label>
              <select className={F} value={form.emergencyRelationship} onChange={(e) => set("emergencyRelationship", e.target.value)}>
                <option value="">— Select —</option>
                <option>Spouse</option><option>Parent</option><option>Sibling</option>
                <option>Child</option><option>Relative</option><option>Friend</option><option>Other</option>
              </select>
            </div>
            <div><label className={L}>Contact Number</label><input className={F} placeholder="+63 9XX XXX XXXX" value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-3 pb-6">
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium shadow">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Employee
        </button>
        <Link href="/admin/hr/employees" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
          Cancel
        </Link>
        <span className="text-xs text-slate-400 ml-auto">
          * Required fields
        </span>
      </div>
    </div>
  );
}
