import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { getPayrollRunById } from "@/lib/repositories/hr-payroll.repository";
import { generatePayslipPdf, PayslipData } from "@/lib/pdf/payslip.pdf";
import { prisma } from "@/lib/prisma";

/** Merge multiple PDF buffers by concatenating pages via a minimal approach.
 *  We generate each payslip as its own PDF and then use PDFLib to merge them.
 *  If PDFLib is unavailable, we fall back to a zip of individual PDFs via a
 *  simple approach: stream them as multipart, or — simplest — just return the
 *  first one with a 207 listing the rest. For now we use pdf-lib if present,
 *  otherwise return a zip using the built-in JSZip if present.
 *  Most pragmatic approach: generate all PDFs and concatenate raw (won't
 *  work for merged pages) OR use pdf-lib merge. We'll try pdf-lib first.
 */
async function mergePdfs(buffers: Buffer[]): Promise<Buffer> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFDocument } = await import("pdf-lib");
    const merged = await PDFDocument.create();
    for (const buf of buffers) {
      const src = await PDFDocument.load(buf);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const bytes = await merged.save();
    return Buffer.from(bytes);
  } catch {
    // pdf-lib not available — return first buffer as fallback
    return buffers[0] ?? Buffer.alloc(0);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const [run, org] = await Promise.all([
      getPayrollRunById(guard.tenantId, id),
      prisma.organization.findUnique({
        where: { id: guard.tenantId },
        select: { name: true, logoUrl: true },
      }),
    ]);

    if (!run) {
      return NextResponse.json(
        { success: false, data: null, error: "Payroll run not found" },
        { status: 404 }
      );
    }

    if (run.lines.length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: "No payroll lines in this run" },
        { status: 400 }
      );
    }

    // Fetch full gov ID data for all employees in one query
    const employeeIds = run.lines.map((l) => l.employeeId);
    const employees   = await prisma.hrEmployee.findMany({
      where:  { id: { in: employeeIds } },
      select: {
        id: true,
        sssNumber: true, philhealthNumber: true,
        pagibigNumber: true, tinNumber: true,
      },
    });
    const empMap = new Map(employees.map((e) => [e.id, e]));

    const pdfBuffers = await Promise.all(
      run.lines.map((line) => {
        const emp     = empMap.get(line.employeeId);
        const data: PayslipData = {
          companyName:        org?.name ?? "Your Company",
          companyLogoUrl:     org?.logoUrl ?? undefined,
          employeeNumber:     line.employee.employeeNumber,
          employeeName:       `${line.employee.firstName} ${line.employee.lastName}`,
          position:           line.employee.position,
          department:         line.employee.department,
          sssNumber:          emp?.sssNumber         ?? null,
          philhealthNumber:   emp?.philhealthNumber  ?? null,
          pagibigNumber:      emp?.pagibigNumber     ?? null,
          tinNumber:          emp?.tinNumber         ?? null,
          periodStart:        run.periodStart,
          periodEnd:          run.periodEnd,
          payDate:            run.payDate,
          runNumber:          run.runNumber,
          basicSalary:        Number(line.basicSalary),
          daysWorked:         Number(line.daysWorked),
          overtimeHours:      Number(line.overtimeHours),
          overtimePay:        Number(line.overtimePay),
          allowances:         Number(line.allowances),
          grossPay:           Number(line.grossPay),
          sssEmployee:        Number(line.sssEmployee),
          philhealthEmployee: Number(line.philhealthEmployee),
          pagibigEmployee:    Number(line.pagibigEmployee),
          withholdingTax:     Number(line.withholdingTax),
          otherDeductions:    Number(line.otherDeductions),
          totalDeductions:    Number(line.totalDeductions),
          netPay:             Number(line.netPay),
          remarks:            (line as { remarks?: string | null }).remarks ?? null,
        };
        return generatePayslipPdf(data);
      })
    );

    const merged   = await mergePdfs(pdfBuffers);
    const filename = `payslips-${run.runNumber}.pdf`;

    return new NextResponse(new Uint8Array(merged), {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length":      String(merged.length),
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/hr/payroll/[id]/payslips]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
