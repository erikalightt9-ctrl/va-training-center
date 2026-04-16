import { renderToBuffer, Document, Page, Text, View, StyleSheet, Line, Svg, Font, Image } from "@react-pdf/renderer";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Font Registration                                                   */
/*  Roboto supports the Philippine Peso sign (₱ U+20B1)                */
/* ------------------------------------------------------------------ */

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf",
      fontWeight: "bold",
    },
  ],
});

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface PayslipData {
  // Company
  companyName: string;
  companyAddress?: string;
  companyLogoUrl?: string;
  // Employee
  employeeNumber: string;
  employeeName: string;
  position: string;
  department: string | null;
  // Period
  periodStart: Date;
  periodEnd: Date;
  payDate: Date | null;
  runNumber: string;
  // Earnings
  basicSalary: number;
  daysWorked: number;
  absentDays?: number;
  lateMins?: number;
  regHolidayDays?: number;
  specHolidayDays?: number;
  holidayPay?: number;
  overtimeHours: number;
  overtimePay: number;
  nightDiffHours?: number;
  nightDiffPay?: number;
  allowances: number;
  grossPay: number;
  // Deductions
  absenceDeduction?: number;
  lateDeduction?: number;
  sssEmployee: number;
  philhealthEmployee: number;
  pagibigEmployee: number;
  withholdingTax: number;
  otherDeductions: number;
  totalDeductions: number;
  // Net
  netPay: number;
  remarks: string | null;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page:          { padding: 36, backgroundColor: "#fff", fontFamily: "Roboto", fontSize: 9 },
  // Header
  header:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  company:       { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  companyLogo:   { height: 44, maxWidth: 120, objectFit: "contain" },
  companyText:   { flex: 1 },
  companyName:   { fontSize: 14, fontWeight: "bold", color: "#1e293b" },
  companyAddr:   { fontSize: 8, color: "#64748b", marginTop: 2 },
  payslipLabel:  { fontSize: 18, fontWeight: "bold", color: "#4f46e5", textAlign: "right" },
  payslipSub:    { fontSize: 8, color: "#94a3b8", textAlign: "right", marginTop: 2 },
  // Divider
  divider:       { marginVertical: 8 },
  // Employee Info
  infoGrid:      { flexDirection: "row", gap: 16, marginBottom: 12 },
  infoBox:       { flex: 1, backgroundColor: "#f8fafc", borderRadius: 4, padding: 8 },
  infoLabel:     { fontSize: 7, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 },
  infoValue:     { fontSize: 9, color: "#1e293b", fontWeight: "bold" },
  infoValueSm:   { fontSize: 8, color: "#475569" },
  // Table
  table:         { marginBottom: 10 },
  tableHeader:   { flexDirection: "row", backgroundColor: "#4f46e5", borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8 },
  tableHeaderTxt:{ color: "#fff", fontSize: 8, fontWeight: "bold", flex: 1 },
  tableHeaderAmt:{ color: "#c7d2fe", fontSize: 8, textAlign: "right", width: 80 },
  tableRow:      { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableRowAlt:   { backgroundColor: "#fafafa" },
  tableCell:     { flex: 1, fontSize: 9, color: "#334155" },
  tableCellAmt:  { width: 80, textAlign: "right", fontSize: 9, color: "#334155" },
  tableTotal:    { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, backgroundColor: "#eef2ff" },
  tableTotalTxt: { flex: 1, fontSize: 9, fontWeight: "bold", color: "#3730a3" },
  tableTotalAmt: { width: 80, textAlign: "right", fontSize: 9, fontWeight: "bold", color: "#3730a3" },
  // Two columns
  cols:          { flexDirection: "row", gap: 12, marginBottom: 10 },
  col:           { flex: 1 },
  // Net pay box
  netBox:        { backgroundColor: "#4f46e5", borderRadius: 6, padding: 14, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  netLabel:      { fontSize: 11, color: "#c7d2fe", fontWeight: "bold" },
  netAmount:     { fontSize: 20, color: "#fff", fontWeight: "bold" },
  // Footer
  footer:        { marginTop: "auto", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerTxt:     { fontSize: 7, color: "#94a3b8" },
  remarksBox:    { backgroundColor: "#fffbeb", borderRadius: 4, padding: 6, marginBottom: 10 },
  remarksLabel:  { fontSize: 7, color: "#92400e", fontWeight: "bold", marginBottom: 2 },
  remarksText:   { fontSize: 8, color: "#78350f" },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const peso = (n: number) =>
  `\u20B1${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

const fmtDateShort = (d: Date) =>
  d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

/**
 * Formats the cut-off period as a compact, human-readable range.
 * Same month & year  →  "April 1–15, 2026"
 * Diff month, same year → "March 16 – April 15, 2026"
 * Diff year            → "December 16, 2025 – January 15, 2026"
 */
function formatCutoffPeriod(start: Date, end: Date): string {
  const sDay   = start.getDate();
  const eDay   = end.getDate();
  const sMonth = start.toLocaleDateString("en-PH", { month: "long" });
  const eMonth = end.toLocaleDateString("en-PH",   { month: "long" });
  const sYear  = start.getFullYear();
  const eYear  = end.getFullYear();

  if (sYear === eYear && sMonth === eMonth) {
    // April 1–15, 2026
    return `${sMonth} ${sDay}–${eDay}, ${sYear}`;
  } else if (sYear === eYear) {
    // March 16 – April 15, 2026
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
  } else {
    // December 16, 2025 – January 15, 2026
    return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
  }
}

/* ------------------------------------------------------------------ */
/*  Row helpers                                                         */
/* ------------------------------------------------------------------ */

function Row({ label, amount, alt }: { label: string; amount: number; alt?: boolean }) {
  return React.createElement(
    View,
    { style: [s.tableRow, ...(alt ? [s.tableRowAlt] : [])] },
    React.createElement(Text, { style: s.tableCell }, label),
    React.createElement(Text, { style: s.tableCellAmt }, peso(amount))
  );
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return React.createElement(
    View,
    { style: s.tableTotal },
    React.createElement(Text, { style: s.tableTotalTxt }, label),
    React.createElement(Text, { style: s.tableTotalAmt }, peso(amount))
  );
}

/* ------------------------------------------------------------------ */
/*  Main PDF component                                                  */
/* ------------------------------------------------------------------ */

function PayslipDocument({ d }: { d: PayslipData }) {
  const cutoffStr = formatCutoffPeriod(d.periodStart, d.periodEnd);

  return React.createElement(
    Document,
    { title: `Payslip \u2013 ${d.employeeName}` },
    React.createElement(
      Page,
      { size: "A4", style: s.page },

      /* ── Header ── */
      React.createElement(
        View,
        { style: s.header },

        /* Left: Logo + Company name */
        React.createElement(
          View,
          { style: s.company },
          d.companyLogoUrl
            ? React.createElement(Image, { src: d.companyLogoUrl, style: s.companyLogo })
            : null,
          React.createElement(
            View,
            { style: s.companyText },
            React.createElement(Text, { style: s.companyName }, d.companyName),
            d.companyAddress
              ? React.createElement(Text, { style: s.companyAddr }, d.companyAddress)
              : null
          )
        ),

        /* Right: PAYSLIP label */
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: s.payslipLabel }, "PAYSLIP"),
          React.createElement(Text, { style: s.payslipSub }, `Run: ${d.runNumber}`),
          React.createElement(Text, { style: s.payslipSub }, `Cut-off: ${cutoffStr}`),
          d.payDate
            ? React.createElement(Text, { style: s.payslipSub }, `Pay Date: ${fmtDateShort(d.payDate)}`)
            : null
        )
      ),

      /* ── Divider ── */
      React.createElement(
        View,
        { style: s.divider },
        React.createElement(Svg, { height: 1, width: "100%" },
          React.createElement(Line, { x1: 0, y1: 0, x2: 595, y2: 0, strokeWidth: 1, stroke: "#e2e8f0" })
        )
      ),

      /* ── Employee Info ── */
      React.createElement(
        View,
        { style: s.infoGrid },
        React.createElement(
          View,
          { style: s.infoBox },
          React.createElement(Text, { style: s.infoLabel }, "Employee"),
          React.createElement(Text, { style: s.infoValue }, d.employeeName),
          React.createElement(Text, { style: s.infoValueSm }, `${d.employeeNumber} \u00B7 ${d.position}`)
        ),
        React.createElement(
          View,
          { style: s.infoBox },
          React.createElement(Text, { style: s.infoLabel }, "Department"),
          React.createElement(Text, { style: s.infoValue }, d.department ?? "\u2014")
        ),
        React.createElement(
          View,
          { style: s.infoBox },
          React.createElement(Text, { style: s.infoLabel }, "Cut-off Period"),
          React.createElement(Text, { style: s.infoValue }, cutoffStr),
          React.createElement(Text, { style: s.infoValueSm }, `Days Worked: ${d.daysWorked}`)
        )
      ),

      /* ── Earnings & Deductions side by side ── */
      React.createElement(
        View,
        { style: s.cols },

        /* Earnings */
        React.createElement(
          View,
          { style: s.col },
          React.createElement(
            View,
            { style: s.table },
            React.createElement(
              View,
              { style: s.tableHeader },
              React.createElement(Text, { style: s.tableHeaderTxt }, "EARNINGS"),
              React.createElement(Text, { style: s.tableHeaderAmt }, "Amount")
            ),
            React.createElement(Row, { label: `Basic Salary (${d.daysWorked} days)`, amount: d.basicSalary }),
            (d.holidayPay ?? 0) > 0
              ? React.createElement(Row, { label: `Holiday Pay (Reg:${d.regHolidayDays ?? 0}/Spec:${d.specHolidayDays ?? 0} days)`, amount: d.holidayPay!, alt: true })
              : null,
            d.overtimePay > 0
              ? React.createElement(Row, { label: `Overtime Pay (${d.overtimeHours}h)`, amount: d.overtimePay })
              : null,
            (d.nightDiffPay ?? 0) > 0
              ? React.createElement(Row, { label: `Night Diff (${d.nightDiffHours ?? 0}h)`, amount: d.nightDiffPay!, alt: true })
              : null,
            d.allowances > 0
              ? React.createElement(Row, { label: "Allowances", amount: d.allowances })
              : null,
            React.createElement(TotalRow, { label: "GROSS PAY", amount: d.grossPay })
          )
        ),

        /* Deductions */
        React.createElement(
          View,
          { style: s.col },
          React.createElement(
            View,
            { style: s.table },
            React.createElement(
              View,
              { style: s.tableHeader },
              React.createElement(Text, { style: s.tableHeaderTxt }, "DEDUCTIONS"),
              React.createElement(Text, { style: s.tableHeaderAmt }, "Amount")
            ),
            (d.absenceDeduction ?? 0) > 0
              ? React.createElement(Row, { label: `Absent (${d.absentDays ?? 0} days)`, amount: d.absenceDeduction! })
              : null,
            (d.lateDeduction ?? 0) > 0
              ? React.createElement(Row, { label: `Late (${d.lateMins ?? 0} mins)`, amount: d.lateDeduction!, alt: true })
              : null,
            React.createElement(Row, { label: "SSS",             amount: d.sssEmployee }),
            React.createElement(Row, { label: "PhilHealth",      amount: d.philhealthEmployee, alt: true }),
            React.createElement(Row, { label: "Pag-IBIG",        amount: d.pagibigEmployee }),
            React.createElement(Row, { label: "Withholding Tax", amount: d.withholdingTax, alt: true }),
            d.otherDeductions > 0
              ? React.createElement(Row, { label: "Other Deductions", amount: d.otherDeductions })
              : null,
            React.createElement(TotalRow, { label: "TOTAL DEDUCTIONS", amount: d.totalDeductions })
          )
        )
      ),

      /* ── Net Pay ── */
      React.createElement(
        View,
        { style: s.netBox },
        React.createElement(Text, { style: s.netLabel }, "NET PAY"),
        React.createElement(Text, { style: s.netAmount }, peso(d.netPay))
      ),

      /* ── Remarks ── */
      d.remarks
        ? React.createElement(
            View,
            { style: s.remarksBox },
            React.createElement(Text, { style: s.remarksLabel }, "REMARKS"),
            React.createElement(Text, { style: s.remarksText }, d.remarks)
          )
        : null,

      /* ── Footer ── */
      React.createElement(
        View,
        { style: s.footer },
        React.createElement(Text, { style: s.footerTxt }, "This is a computer-generated payslip. No signature required."),
        React.createElement(Text, { style: s.footerTxt }, `Generated on ${fmtDate(new Date())}`)
      )
    )
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export async function generatePayslipPdf(data: PayslipData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(PayslipDocument as any, { d: data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(doc as any) as Promise<Buffer>;
}
