import { renderToBuffer, Document, Page, Text, View, StyleSheet, Line, Svg } from "@react-pdf/renderer";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface PayslipData {
  // Company
  companyName: string;
  companyAddress?: string;
  // Employee
  employeeNumber: string;
  employeeName: string;
  position: string;
  department: string | null;
  sssNumber: string | null;
  philhealthNumber: string | null;
  pagibigNumber: string | null;
  tinNumber: string | null;
  // Period
  periodStart: Date;
  periodEnd: Date;
  payDate: Date | null;
  runNumber: string;
  // Earnings
  basicSalary: number;
  daysWorked: number;
  overtimeHours: number;
  overtimePay: number;
  allowances: number;
  grossPay: number;
  // Deductions
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
  page:         { padding: 36, backgroundColor: "#fff", fontFamily: "Helvetica", fontSize: 9 },
  // Header
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  company:      { flex: 1 },
  companyName:  { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1e293b" },
  companyAddr:  { fontSize: 8, color: "#64748b", marginTop: 2 },
  payslipLabel: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#4f46e5", textAlign: "right" },
  payslipSub:   { fontSize: 8, color: "#94a3b8", textAlign: "right", marginTop: 2 },
  // Divider
  divider:      { marginVertical: 8 },
  // Employee Info
  infoGrid:     { flexDirection: "row", gap: 16, marginBottom: 12 },
  infoBox:      { flex: 1, backgroundColor: "#f8fafc", borderRadius: 4, padding: 8 },
  infoLabel:    { fontSize: 7, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 },
  infoValue:    { fontSize: 9, color: "#1e293b", fontFamily: "Helvetica-Bold" },
  infoValueSm:  { fontSize: 8, color: "#475569" },
  // Gov IDs
  govRow:       { flexDirection: "row", gap: 8, marginBottom: 12 },
  govItem:      { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 6 },
  govLabel:     { fontSize: 7, color: "#94a3b8", textTransform: "uppercase", marginBottom: 1 },
  govValue:     { fontSize: 8, color: "#334155", fontFamily: "Helvetica-Bold" },
  // Table
  table:        { marginBottom: 10 },
  tableHeader:  { flexDirection: "row", backgroundColor: "#4f46e5", borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8 },
  tableHeaderTxt:{ color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold", flex: 1 },
  tableHeaderAmt:{ color: "#c7d2fe", fontSize: 8, textAlign: "right", width: 80 },
  tableRow:     { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableRowAlt:  { backgroundColor: "#fafafa" },
  tableCell:    { flex: 1, fontSize: 9, color: "#334155" },
  tableCellAmt: { width: 80, textAlign: "right", fontSize: 9, color: "#334155" },
  tableTotal:   { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, backgroundColor: "#eef2ff" },
  tableTotalTxt:{ flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#3730a3" },
  tableTotalAmt:{ width: 80, textAlign: "right", fontSize: 9, fontFamily: "Helvetica-Bold", color: "#3730a3" },
  // Two columns
  cols:         { flexDirection: "row", gap: 12, marginBottom: 10 },
  col:          { flex: 1 },
  // Net pay box
  netBox:       { backgroundColor: "#4f46e5", borderRadius: 6, padding: 14, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  netLabel:     { fontSize: 11, color: "#c7d2fe", fontFamily: "Helvetica-Bold" },
  netAmount:    { fontSize: 20, color: "#fff", fontFamily: "Helvetica-Bold" },
  // Footer
  footer:       { marginTop: "auto", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerTxt:    { fontSize: 7, color: "#94a3b8" },
  remarksBox:   { backgroundColor: "#fffbeb", borderRadius: 4, padding: 6, marginBottom: 10 },
  remarksLabel: { fontSize: 7, color: "#92400e", fontFamily: "Helvetica-Bold", marginBottom: 2 },
  remarksText:  { fontSize: 8, color: "#78350f" },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

const fmtDateShort = (d: Date) =>
  d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

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
  const periodStr = `${fmtDateShort(d.periodStart)} – ${fmtDateShort(d.periodEnd)}`;

  return React.createElement(
    Document,
    { title: `Payslip – ${d.employeeName}` },
    React.createElement(
      Page,
      { size: "A4", style: s.page },

      /* ── Header ── */
      React.createElement(
        View,
        { style: s.header },
        React.createElement(
          View,
          { style: s.company },
          React.createElement(Text, { style: s.companyName }, d.companyName),
          d.companyAddress
            ? React.createElement(Text, { style: s.companyAddr }, d.companyAddress)
            : null
        ),
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: s.payslipLabel }, "PAYSLIP"),
          React.createElement(Text, { style: s.payslipSub }, `Run: ${d.runNumber}`),
          React.createElement(Text, { style: s.payslipSub }, periodStr),
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
          React.createElement(Text, { style: s.infoValueSm }, `${d.employeeNumber} · ${d.position}`)
        ),
        React.createElement(
          View,
          { style: s.infoBox },
          React.createElement(Text, { style: s.infoLabel }, "Department"),
          React.createElement(Text, { style: s.infoValue }, d.department ?? "—")
        ),
        React.createElement(
          View,
          { style: s.infoBox },
          React.createElement(Text, { style: s.infoLabel }, "Pay Period"),
          React.createElement(Text, { style: s.infoValue }, periodStr),
          React.createElement(Text, { style: s.infoValueSm }, `Days Worked: ${d.daysWorked}`)
        )
      ),

      /* ── Government IDs ── */
      React.createElement(
        View,
        { style: s.govRow },
        React.createElement(
          View, { style: s.govItem },
          React.createElement(Text, { style: s.govLabel }, "SSS No."),
          React.createElement(Text, { style: s.govValue }, d.sssNumber ?? "—")
        ),
        React.createElement(
          View, { style: s.govItem },
          React.createElement(Text, { style: s.govLabel }, "PhilHealth No."),
          React.createElement(Text, { style: s.govValue }, d.philhealthNumber ?? "—")
        ),
        React.createElement(
          View, { style: s.govItem },
          React.createElement(Text, { style: s.govLabel }, "Pag-IBIG No."),
          React.createElement(Text, { style: s.govValue }, d.pagibigNumber ?? "—")
        ),
        React.createElement(
          View, { style: s.govItem },
          React.createElement(Text, { style: s.govLabel }, "TIN"),
          React.createElement(Text, { style: s.govValue }, d.tinNumber ?? "—")
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
            React.createElement(Row, { label: "Basic Salary",   amount: d.basicSalary }),
            d.overtimePay > 0
              ? React.createElement(Row, { label: `Overtime (${d.overtimeHours}h × 1.25)`, amount: d.overtimePay, alt: true })
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
            React.createElement(Row, { label: "SSS",           amount: d.sssEmployee }),
            React.createElement(Row, { label: "PhilHealth",    amount: d.philhealthEmployee, alt: true }),
            React.createElement(Row, { label: "Pag-IBIG",      amount: d.pagibigEmployee }),
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
