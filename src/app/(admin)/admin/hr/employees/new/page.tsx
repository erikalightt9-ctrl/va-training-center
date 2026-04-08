"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const LABEL = "block text-xs text-slate-500 mb-1";

export default function NewEmployeePage() {
  const router  = useRouter();
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState({
    firstName: "", lastName: "", middleName: "",
    email: "", phone: "",
    position: "", department: "",
    employmentType: "REGULAR",
    hireDate: new Date().toISOString().split("T")[0],
    basicSalary: "",
    sssNumber: "", philhealthNumber: "", pagibigNumber: "", tinNumber: "",
    birthDate: "", gender: "", civilStatus: "",
    address: "", emergencyContact: "", emergencyPhone: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.position || !form.hireDate || !form.basicSalary) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, basicSalary: parseFloat(form.basicSalary) }),
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
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/hr/employees" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add Employee</h1>
          <p className="text-sm text-slate-500">Create a new employee 201 file</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Personal Information</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>First Name *</label>
            <input className={FIELD} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Last Name *</label>
            <input className={FIELD} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Middle Name</label>
            <input className={FIELD} value={form.middleName} onChange={(e) => set("middleName", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Email *</label>
            <input type="email" className={FIELD} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Phone</label>
            <input className={FIELD} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Birth Date</label>
            <input type="date" className={FIELD} value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Gender</label>
            <select className={FIELD} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">—</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Civil Status</label>
            <select className={FIELD} value={form.civilStatus} onChange={(e) => set("civilStatus", e.target.value)}>
              <option value="">—</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
        </div>
        <div>
          <label className={LABEL}>Home Address</label>
          <textarea className={FIELD} rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Emergency Contact Name</label>
            <input className={FIELD} value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Emergency Contact Phone</label>
            <input className={FIELD} value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Employment Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Position *</label>
            <input className={FIELD} value={form.position} onChange={(e) => set("position", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Department</label>
            <input className={FIELD} value={form.department} onChange={(e) => set("department", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Employment Type</label>
            <select className={FIELD} value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
              <option value="REGULAR">Regular</option>
              <option value="PROBATIONARY">Probationary</option>
              <option value="CONTRACTUAL">Contractual</option>
              <option value="PART_TIME">Part-Time</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Hire Date *</label>
            <input type="date" className={FIELD} value={form.hireDate} onChange={(e) => set("hireDate", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Basic Monthly Salary (₱) *</label>
            <input type="number" min="0" className={FIELD} value={form.basicSalary} onChange={(e) => set("basicSalary", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Government IDs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
          Government IDs <span className="text-xs font-normal text-slate-400 ml-1">PH Compliance</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>SSS Number</label>
            <input className={FIELD} placeholder="XX-XXXXXXX-X" value={form.sssNumber} onChange={(e) => set("sssNumber", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>PhilHealth Number</label>
            <input className={FIELD} placeholder="XX-XXXXXXXXX-X" value={form.philhealthNumber} onChange={(e) => set("philhealthNumber", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Pag-IBIG (HDMF) Number</label>
            <input className={FIELD} placeholder="XXXX-XXXX-XXXX" value={form.pagibigNumber} onChange={(e) => set("pagibigNumber", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>TIN (Tax ID Number)</label>
            <input className={FIELD} placeholder="XXX-XXX-XXX" value={form.tinNumber} onChange={(e) => set("tinNumber", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Employee
        </button>
        <Link href="/admin/hr/employees" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
          Cancel
        </Link>
      </div>
    </div>
  );
}
