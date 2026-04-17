import {
  renderToBuffer, Document, Page, Text, View, StyleSheet, Font, Svg, Line,
} from "@react-pdf/renderer";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Font                                                                */
/* ------------------------------------------------------------------ */

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf",   fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf", fontWeight: "bold" },
  ],
});

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface Employee201Data {
  // Personal
  employeeNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  birthDate?: Date | null;
  gender?: string | null;
  civilStatus?: string | null;
  nationality?: string | null;
  phone?: string | null;
  email: string;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  // Government IDs
  sssNumber?: string | null;
  philhealthNumber?: string | null;
  pagibigNumber?: string | null;
  tinNumber?: string | null;
  // Employment
  position: string;
  department?: string | null;
  employmentType: string;
  status: string;
  hireDate: Date;
  regularizationDate?: Date | null;
  separationDate?: Date | null;
  lastWorkingDate?: Date | null;
  // Compensation
  basicSalary: number;
  allowance?: number | null;
  payrollType?: string | null;
  // Emergency
  emergencyContact?: string | null;
  emergencyRelationship?: string | null;
  emergencyPhone?: string | null;
  // Remarks
  remarks?: string | null;
  // Company
  companyName: string;
  printedAt?: Date;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const C = {
  primary:  "#4338ca",
  light:    "#eef2ff",
  border:   "#c7d2fe",
  label:    "#6366f1",
  text:     "#1e293b",
  muted:    "#64748b",
  white:    "#ffffff",
  divider:  "#e2e8f0",
  danger:   "#dc2626",
};

const s = StyleSheet.create({
  page:       { fontFamily: "Roboto", fontSize: 9, color: C.text, padding: 32, backgroundColor: C.white },
  header:     { backgroundColor: C.primary, borderRadius: 6, padding: "12 16", marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerL:    { color: C.white },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: C.white },
  headerSub:  { fontSize: 8, color: "#c7d2fe", marginTop: 2 },
  headerR:    { alignItems: "flex-end" },
  headerEmpNo:{ fontSize: 11, fontWeight: "bold", color: C.white },
  headerDate: { fontSize: 7, color: "#c7d2fe", marginTop: 2 },
  section:    { marginBottom: 10 },
  secTitle:   { fontSize: 8, fontWeight: "bold", color: C.label, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5, borderBottom: `1 solid ${C.border}`, paddingBottom: 2 },
  row:        { flexDirection: "row", marginBottom: 3 },
  col2:       { flexDirection: "row", flex: 1 },
  field:      { flex: 1, marginRight: 8 },
  label:      { fontSize: 7, color: C.muted, marginBottom: 1 },
  value:      { fontSize: 9, color: C.text, minHeight: 11 },
  divider:    { borderBottom: `1 solid ${C.divider}`, marginVertical: 8 },
  govRow:     { flexDirection: "row", gap: 8 },
  govBox:     { flex: 1, backgroundColor: C.light, borderRadius: 4, padding: "5 8" },
  govLabel:   { fontSize: 7, color: C.label, fontWeight: "bold", marginBottom: 2 },
  govValue:   { fontSize: 10, fontWeight: "bold", color: C.text, letterSpacing: 0.3 },
  compRow:    { flexDirection: "row", gap: 8 },
  compBox:    { flex: 1, backgroundColor: "#f0fdf4", borderRadius: 4, padding: "6 10", borderLeft: `3 solid #16a34a` },
  compLabel:  { fontSize: 7, color: "#166534", marginBottom: 2 },
  compValue:  { fontSize: 12, fontWeight: "bold", color: "#15803d" },
  statusBadge: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 },
  footer:     { position: "absolute", bottom: 20, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${C.divider}`, paddingTop: 5 },
  footerText: { fontSize: 7, color: C.muted },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmt    = (d?: Date | null) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—";
const peso   = (n: number)       => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const blank  = (v?: string | null) => v || "—";

function SectionTitle({ title }: { title: string }) {
  return <Text style={s.secTitle}>{title}</Text>;
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={[s.field, wide ? { flex: 2 } : {}]}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:      "#dcfce7",
  ON_LEAVE:    "#fef9c3",
  RESIGNED:    "#fee2e2",
  TERMINATED:  "#fee2e2",
  INACTIVE:    "#f1f5f9",
};

/* ------------------------------------------------------------------ */
/*  Document Component                                                  */
/* ------------------------------------------------------------------ */

function Employee201Doc({ e }: { e: Employee201Data }) {
  const statusBg    = STATUS_COLORS[e.status] ?? "#f1f5f9";
  const fullName    = `${e.lastName}, ${e.firstName}${e.middleName ? ` ${e.middleName}` : ""}`;
  const printedDate = fmt(e.printedAt ?? new Date());

  return (
    <Document title={`Employee 201 — ${fullName}`} author={e.companyName}>
      <Page size="A4" style={s.page}>

        {/* ─── Header ─── */}
        <View style={s.header}>
          <View style={s.headerL}>
            <Text style={s.headerTitle}>Employee 201 File</Text>
            <Text style={s.headerSub}>{e.companyName}</Text>
          </View>
          <View style={s.headerR}>
            <Text style={s.headerEmpNo}>{e.employeeNumber}</Text>
            <Text style={s.headerDate}>Printed: {printedDate}</Text>
          </View>
        </View>

        {/* ─── Status badge ─── */}
        <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text }}>{e.status.replace("_", " ")}</Text>
        </View>

        {/* ─── Personal Information ─── */}
        <View style={s.section}>
          <SectionTitle title="I. Personal Information" />
          <View style={s.row}>
            <Field label="Last Name"   value={e.lastName}         />
            <Field label="First Name"  value={e.firstName}        />
            <Field label="Middle Name" value={blank(e.middleName)} />
          </View>
          <View style={s.row}>
            <Field label="Date of Birth"  value={fmt(e.birthDate)}        />
            <Field label="Gender"         value={blank(e.gender)}          />
            <Field label="Civil Status"   value={blank(e.civilStatus)}     />
            <Field label="Nationality"    value={blank(e.nationality)}     />
          </View>
          <View style={s.row}>
            <Field label="Email"   value={e.email}       wide />
            <Field label="Phone"   value={blank(e.phone)}     />
          </View>
          <View style={[s.row, { marginTop: 2 }]}>
            <Field label="Present Address"   value={blank(e.presentAddress)}   wide />
          </View>
          <View style={s.row}>
            <Field label="Permanent Address" value={blank(e.permanentAddress)} wide />
          </View>
        </View>

        {/* ─── Government IDs ─── */}
        <View style={s.section}>
          <SectionTitle title="II. Government IDs (PH Compliance)" />
          <View style={s.govRow}>
            <View style={s.govBox}>
              <Text style={s.govLabel}>SSS NUMBER</Text>
              <Text style={s.govValue}>{blank(e.sssNumber)}</Text>
            </View>
            <View style={s.govBox}>
              <Text style={s.govLabel}>PHILHEALTH NUMBER</Text>
              <Text style={s.govValue}>{blank(e.philhealthNumber)}</Text>
            </View>
            <View style={s.govBox}>
              <Text style={s.govLabel}>PAG-IBIG (HDMF)</Text>
              <Text style={s.govValue}>{blank(e.pagibigNumber)}</Text>
            </View>
            <View style={s.govBox}>
              <Text style={s.govLabel}>TIN</Text>
              <Text style={s.govValue}>{blank(e.tinNumber)}</Text>
            </View>
          </View>
        </View>

        {/* ─── Employment Details ─── */}
        <View style={s.section}>
          <SectionTitle title="III. Employment Details" />
          <View style={s.row}>
            <Field label="Position"         value={e.position}                         />
            <Field label="Department"       value={blank(e.department)}               />
            <Field label="Employment Type"  value={e.employmentType.replace("_", " ")} />
          </View>
          <View style={s.row}>
            <Field label="Date Hired"            value={fmt(e.hireDate)}             />
            <Field label="Regularization Date"   value={fmt(e.regularizationDate)}   />
            <Field label="Separation Date"       value={fmt(e.separationDate)}        />
            <Field label="Last Working Date"     value={fmt(e.lastWorkingDate)}       />
          </View>
          {e.remarks && (
            <View style={s.row}>
              <Field label="Remarks" value={e.remarks} wide />
            </View>
          )}
        </View>

        {/* ─── Compensation ─── */}
        <View style={s.section}>
          <SectionTitle title="IV. Compensation" />
          <View style={s.compRow}>
            <View style={s.compBox}>
              <Text style={s.compLabel}>BASIC MONTHLY SALARY</Text>
              <Text style={s.compValue}>{peso(e.basicSalary)}</Text>
            </View>
            <View style={s.compBox}>
              <Text style={s.compLabel}>ALLOWANCE</Text>
              <Text style={s.compValue}>{peso(e.allowance ?? 0)}</Text>
            </View>
            <View style={[s.compBox, { backgroundColor: "#f0f9ff", borderLeft: "3 solid #0284c7" }]}>
              <Text style={[s.compLabel, { color: "#075985" }]}>PAYROLL TYPE</Text>
              <Text style={[s.compValue, { color: "#0369a1", fontSize: 10 }]}>{(e.payrollType ?? "MONTHLY").replace("_", "-")}</Text>
            </View>
          </View>
        </View>

        {/* ─── Emergency Contact ─── */}
        <View style={s.section}>
          <SectionTitle title="V. Emergency Contact" />
          <View style={s.row}>
            <Field label="Contact Name"     value={blank(e.emergencyContact)}      />
            <Field label="Relationship"     value={blank(e.emergencyRelationship)} />
            <Field label="Contact Number"   value={blank(e.emergencyPhone)}        />
          </View>
        </View>

        {/* ─── Signature Block ─── */}
        <View style={[s.section, { marginTop: 16 }]}>
          <View style={{ flexDirection: "row", gap: 24 }}>
            {(["Prepared By", "Verified By", "Approved By"] as const).map((lbl) => (
              <View key={lbl} style={{ flex: 1, alignItems: "center" }}>
                <View style={{ borderBottom: "1 solid #94a3b8", width: "100%", marginBottom: 4 }} />
                <Text style={{ fontSize: 7, color: C.muted }}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Footer ─── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{e.companyName} — Employee 201 File</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export async function generateEmployee201Pdf(data: Employee201Data): Promise<Buffer> {
  return renderToBuffer(<Employee201Doc e={data} />) as Promise<Buffer>;
}
