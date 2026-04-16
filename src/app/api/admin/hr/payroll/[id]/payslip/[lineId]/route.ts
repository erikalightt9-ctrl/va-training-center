import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { getPayrollLineWithEmployee } from "@/lib/repositories/hr-payroll.repository";
import { generatePayslipPdf } from "@/lib/pdf/payslip.pdf";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id, lineId } = await params;
    const [line, org] = await Promise.all([
      getPayrollLineWithEmployee(guard.tenantId, id, lineId),
      prisma.organization.findUnique({
        where: { id: guard.tenantId },
        select: { name: true, logoUrl: true },
      }),
    ]);

    if (!line) {
      return NextResponse.json(
        { success: false, data: null, error: "Payslip not found" },
        { status: 404 }
      );
    }

    const { employee, payrollRun: run } = line;

    const pdfBuffer = await generatePayslipPdf({
      companyName:            org?.name ?? "Your Company",
      companyLogoUrl:         org?.logoUrl ?? undefined,
      // Employee
      employeeNumber:         employee.employeeNumber,
      employeeName:           `${employee.firstName} ${employee.lastName}`,
      position:               employee.position,
      department:             employee.department,
      // Period
      periodStart:            run.periodStart,
      periodEnd:              run.periodEnd,
      payDate:                run.payDate,
      runNumber:              run.runNumber,
      // Earnings
      basicSalary:            Number(line.basicSalary),
      daysWorked:             Number(line.daysWorked),
      absentDays:             Number(line.absentDays),
      lateMins:               Number(line.lateMins),
      regHolidayDays:         Number(line.regHolidayDays),
      specHolidayDays:        Number(line.specHolidayDays),
      holidayPay:             Number(line.holidayPay),
      overtimeHours:          Number(line.overtimeHours),
      overtimePay:            Number(line.overtimePay),
      nightDiffHours:         Number(line.nightDiffHours),
      nightDiffPay:           Number(line.nightDiffPay),
      allowances:             Number(line.allowances),
      grossPay:               Number(line.grossPay),
      // Deductions
      absenceDeduction:       Number(line.absenceDeduction),
      lateDeduction:          Number(line.lateDeduction),
      sssEmployee:            Number(line.sssEmployee),
      philhealthEmployee:     Number(line.philhealthEmployee),
      pagibigEmployee:        Number(line.pagibigEmployee),
      withholdingTax:         Number(line.withholdingTax),
      otherDeductions:        Number(line.otherDeductions),
      totalDeductions:        Number(line.totalDeductions),
      // Net
      netPay:                 Number(line.netPay),
      remarks:                line.remarks ?? null,
    });

    const filename = `payslip-${employee.employeeNumber}-${run.runNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length":      String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/hr/payroll/[id]/payslip/[lineId]]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
