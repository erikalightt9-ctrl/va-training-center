import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* ================================================================== */
/*  Government Contribution Rules                                       */
/* ================================================================== */

export interface GovContribRuleInput {
  contributionType: "SSS" | "PHILHEALTH" | "PAGIBIG" | "INCOME_TAX";
  salaryFrom: number;
  salaryTo?: number;
  employeeShare: number;
  employerShare: number;
  ruleKind: "FIXED" | "RATE";
  effectiveDate: Date;
}

export async function listGovContribRules(organizationId: string) {
  return prisma.hrGovContribRule.findMany({
    where: { organizationId, isActive: true },
    orderBy: [{ contributionType: "asc" }, { salaryFrom: "asc" }],
  });
}

export async function createGovContribRule(
  organizationId: string,
  data: GovContribRuleInput
) {
  return prisma.hrGovContribRule.create({
    data: {
      organizationId,
      contributionType: data.contributionType,
      salaryFrom:   new Prisma.Decimal(data.salaryFrom),
      salaryTo:     data.salaryTo ? new Prisma.Decimal(data.salaryTo) : null,
      employeeShare: new Prisma.Decimal(data.employeeShare),
      employerShare: new Prisma.Decimal(data.employerShare),
      ruleKind:     data.ruleKind,
      effectiveDate: data.effectiveDate,
    },
  });
}

export async function seedDefaultPhGovRules(organizationId: string) {
  type RuleInput = Omit<GovContribRuleInput, "effectiveDate"> & { effectiveDate: Date };
  const effective = new Date("2024-01-01");

  // SSS — 2024 contribution table (simplified fixed amounts)
  const sssRules: RuleInput[] = [
    { contributionType: "SSS", salaryFrom: 0,      salaryTo: 4249.99,  employeeShare: 180,  employerShare: 380,  ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 4250,   salaryTo: 4749.99,  employeeShare: 202.5, employerShare: 427.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 4750,   salaryTo: 5249.99,  employeeShare: 225,  employerShare: 472.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 5250,   salaryTo: 5749.99,  employeeShare: 247.5, employerShare: 517.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 5750,   salaryTo: 6249.99,  employeeShare: 270,  employerShare: 562.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 6250,   salaryTo: 6749.99,  employeeShare: 292.5, employerShare: 607.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 6750,   salaryTo: 7249.99,  employeeShare: 315,  employerShare: 652.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 7250,   salaryTo: 7749.99,  employeeShare: 337.5, employerShare: 697.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 7750,   salaryTo: 8249.99,  employeeShare: 360,  employerShare: 742.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 8250,   salaryTo: 8749.99,  employeeShare: 382.5, employerShare: 787.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 8750,   salaryTo: 9249.99,  employeeShare: 405,  employerShare: 832.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 9250,   salaryTo: 9749.99,  employeeShare: 427.5, employerShare: 877.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 9750,   salaryTo: 10249.99, employeeShare: 450,  employerShare: 922.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 10250,  salaryTo: 10749.99, employeeShare: 472.5, employerShare: 967.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 10750,  salaryTo: 11249.99, employeeShare: 495,  employerShare: 1012.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 11250,  salaryTo: 11749.99, employeeShare: 517.5, employerShare: 1057.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 11750,  salaryTo: 12249.99, employeeShare: 540,  employerShare: 1102.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 12250,  salaryTo: 12749.99, employeeShare: 562.5, employerShare: 1147.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 12750,  salaryTo: 13249.99, employeeShare: 585,  employerShare: 1192.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 13250,  salaryTo: 13749.99, employeeShare: 607.5, employerShare: 1237.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 13750,  salaryTo: 14249.99, employeeShare: 630,  employerShare: 1282.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 14250,  salaryTo: 14749.99, employeeShare: 652.5, employerShare: 1327.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 14750,  salaryTo: 15249.99, employeeShare: 675,  employerShare: 1372.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 15250,  salaryTo: 15749.99, employeeShare: 697.5, employerShare: 1417.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 15750,  salaryTo: 16249.99, employeeShare: 720,  employerShare: 1462.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 16250,  salaryTo: 16749.99, employeeShare: 742.5, employerShare: 1507.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 16750,  salaryTo: 17249.99, employeeShare: 765,  employerShare: 1552.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 17250,  salaryTo: 17749.99, employeeShare: 787.5, employerShare: 1597.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 17750,  salaryTo: 18249.99, employeeShare: 810,  employerShare: 1642.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 18250,  salaryTo: 18749.99, employeeShare: 832.5, employerShare: 1687.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 18750,  salaryTo: 19249.99, employeeShare: 855,  employerShare: 1732.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 19250,  salaryTo: 19749.99, employeeShare: 877.5, employerShare: 1777.5, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "SSS", salaryFrom: 19750,  salaryTo: undefined, employeeShare: 900,  employerShare: 1800,  ruleKind: "FIXED", effectiveDate: effective },
  ];

  // PhilHealth — 5% of basic salary (equal split), max ₱100,000 basis (2024)
  const philhealthRules: RuleInput[] = [
    { contributionType: "PHILHEALTH", salaryFrom: 0, salaryTo: 10000, employeeShare: 500, employerShare: 500, ruleKind: "FIXED", effectiveDate: effective },
    { contributionType: "PHILHEALTH", salaryFrom: 10000.01, salaryTo: 99999.99, employeeShare: 2.5, employerShare: 2.5, ruleKind: "RATE", effectiveDate: effective },
    { contributionType: "PHILHEALTH", salaryFrom: 100000, salaryTo: undefined, employeeShare: 2500, employerShare: 2500, ruleKind: "FIXED", effectiveDate: effective },
  ];

  // Pag-IBIG — ₱100 employee / ₱200 employer (simplified — max salary basis ₱5,000)
  const pagibigRules: RuleInput[] = [
    { contributionType: "PAGIBIG", salaryFrom: 0, salaryTo: 1500, employeeShare: 1, employerShare: 2, ruleKind: "RATE", effectiveDate: effective },
    { contributionType: "PAGIBIG", salaryFrom: 1500.01, salaryTo: undefined, employeeShare: 2, employerShare: 2, ruleKind: "RATE", effectiveDate: effective },
  ];

  const allRules = [...sssRules, ...philhealthRules, ...pagibigRules];

  // Clear existing and re-seed
  await prisma.hrGovContribRule.deleteMany({ where: { organizationId } });
  await prisma.hrGovContribRule.createMany({
    data: allRules.map((r) => ({
      organizationId,
      contributionType: r.contributionType,
      salaryFrom:    new Prisma.Decimal(r.salaryFrom),
      salaryTo:      r.salaryTo ? new Prisma.Decimal(r.salaryTo) : null,
      employeeShare: new Prisma.Decimal(r.employeeShare),
      employerShare: new Prisma.Decimal(r.employerShare),
      ruleKind:      r.ruleKind,
      effectiveDate: r.effectiveDate,
    })),
  });
}

/* ================================================================== */
/*  Payroll Engine                                                      */
/* ================================================================== */

interface ContributionResult {
  employee: number;
  employer: number;
}

function computeContribution(
  rules: Awaited<ReturnType<typeof listGovContribRules>>,
  type: string,
  salary: number
): ContributionResult {
  const match = rules
    .filter((r) => r.contributionType === type)
    .find((r) => {
      const from = Number(r.salaryFrom);
      const to   = r.salaryTo ? Number(r.salaryTo) : Infinity;
      return salary >= from && salary <= to;
    });

  if (!match) return { employee: 0, employer: 0 };

  if (match.ruleKind === "RATE") {
    const rate = Number(match.employeeShare) / 100;
    const eRate = Number(match.employerShare) / 100;
    return { employee: salary * rate, employer: salary * eRate };
  }
  return { employee: Number(match.employeeShare), employer: Number(match.employerShare) };
}

function computeWithholdingTax(monthlyTaxableIncome: number): number {
  // BIR 2024 graduated rates (monthly)
  if (monthlyTaxableIncome <= 20833) return 0;
  if (monthlyTaxableIncome <= 33332) return (monthlyTaxableIncome - 20833) * 0.15;
  if (monthlyTaxableIncome <= 66666) return 1875 + (monthlyTaxableIncome - 33333) * 0.20;
  if (monthlyTaxableIncome <= 166666) return 8541.80 + (monthlyTaxableIncome - 66667) * 0.25;
  if (monthlyTaxableIncome <= 666666) return 33541.80 + (monthlyTaxableIncome - 166667) * 0.30;
  return 183541.80 + (monthlyTaxableIncome - 666667) * 0.35;
}

export interface PayrollLineInput {
  employeeId: string;
  basicSalary: number;
  daysWorked?: number;
  overtimeHours?: number;
  allowances?: number;
  otherDeductions?: number;
  remarks?: string;
}

export async function computePayrollLine(
  organizationId: string,
  input: PayrollLineInput
) {
  const rules = await listGovContribRules(organizationId);

  const totalWorkingDays = 22;
  const daysWorked    = input.daysWorked ?? totalWorkingDays;
  const dailyRate     = input.basicSalary / totalWorkingDays;
  const earnedSalary  = dailyRate * daysWorked;
  const overtimePay   = input.overtimeHours ? (dailyRate / 8) * 1.25 * input.overtimeHours : 0;
  const allowances    = input.allowances ?? 0;
  const grossPay      = earnedSalary + overtimePay + allowances;

  const sss        = computeContribution(rules, "SSS",        input.basicSalary);
  const philhealth = computeContribution(rules, "PHILHEALTH", input.basicSalary);
  const pagibig    = computeContribution(rules, "PAGIBIG",    input.basicSalary);

  const taxableIncome = grossPay - sss.employee - philhealth.employee - pagibig.employee;
  const withholdingTax = computeWithholdingTax(taxableIncome);

  const totalDeductions =
    sss.employee + philhealth.employee + pagibig.employee +
    withholdingTax + (input.otherDeductions ?? 0);
  const netPay = grossPay - totalDeductions;

  return {
    employeeId:          input.employeeId,
    basicSalary:         input.basicSalary,
    daysWorked,
    overtimeHours:       input.overtimeHours ?? 0,
    overtimePay,
    allowances,
    grossPay,
    sssEmployee:         sss.employee,
    sssEmployer:         sss.employer,
    philhealthEmployee:  philhealth.employee,
    philhealthEmployer:  philhealth.employer,
    pagibigEmployee:     pagibig.employee,
    pagibigEmployer:     pagibig.employer,
    withholdingTax,
    otherDeductions:     input.otherDeductions ?? 0,
    totalDeductions,
    netPay,
    remarks:             input.remarks ?? null,
  };
}

/* ================================================================== */
/*  Payroll Run CRUD                                                    */
/* ================================================================== */

async function getNextRunNumber(organizationId: string): Promise<string> {
  const count = await prisma.hrPayrollRun.count({ where: { organizationId } });
  const year  = new Date().getFullYear();
  return `PR-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function listPayrollRuns(
  organizationId: string,
  filters: { status?: string; page?: number; limit?: number }
) {
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 10;

  const where: Prisma.HrPayrollRunWhereInput = {
    organizationId,
    ...(filters.status && { status: filters.status as never }),
  };

  const [data, total] = await Promise.all([
    prisma.hrPayrollRun.findMany({
      where,
      include: { _count: { select: { lines: true } } },
      orderBy: { periodStart: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.hrPayrollRun.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getPayrollLineWithEmployee(
  organizationId: string,
  runId: string,
  lineId: string
) {
  return prisma.hrPayrollLine.findFirst({
    where: {
      id: lineId,
      payrollRunId: runId,
      payrollRun: { organizationId },
    },
    include: {
      payrollRun: true,
      employee: {
        select: {
          firstName: true, lastName: true, employeeNumber: true,
          position: true, department: true,
          sssNumber: true, philhealthNumber: true,
          pagibigNumber: true, tinNumber: true,
        },
      },
    },
  });
}

export async function getPayrollRunById(organizationId: string, id: string) {
  return prisma.hrPayrollRun.findFirst({
    where: { id, organizationId },
    include: {
      lines: {
        include: {
          employee: {
            select: {
              firstName: true, lastName: true, employeeNumber: true,
              position: true, department: true,
            },
          },
        },
      },
    },
  });
}

export async function createPayrollRun(
  organizationId: string,
  data: {
    periodStart: Date;
    periodEnd: Date;
    payDate?: Date;
    notes?: string;
    createdById?: string;
    lines: PayrollLineInput[];
  }
) {
  const runNumber = await getNextRunNumber(organizationId);
  const computed  = await Promise.all(
    data.lines.map((l) => computePayrollLine(organizationId, l))
  );

  const totalGross      = computed.reduce((s, l) => s + l.grossPay,        0);
  const totalDeductions = computed.reduce((s, l) => s + l.totalDeductions,  0);
  const totalNet        = computed.reduce((s, l) => s + l.netPay,           0);

  return prisma.hrPayrollRun.create({
    data: {
      organizationId,
      runNumber,
      periodStart:      data.periodStart,
      periodEnd:        data.periodEnd,
      payDate:          data.payDate    ?? null,
      notes:            data.notes      ?? null,
      createdById:      data.createdById ?? null,
      totalGross:       new Prisma.Decimal(totalGross),
      totalDeductions:  new Prisma.Decimal(totalDeductions),
      totalNet:         new Prisma.Decimal(totalNet),
      status:           "DRAFT",
      lines: {
        create: computed.map((l) => ({
          employeeId:          l.employeeId,
          basicSalary:         new Prisma.Decimal(l.basicSalary),
          daysWorked:          new Prisma.Decimal(l.daysWorked),
          overtimeHours:       new Prisma.Decimal(l.overtimeHours),
          overtimePay:         new Prisma.Decimal(l.overtimePay),
          allowances:          new Prisma.Decimal(l.allowances),
          grossPay:            new Prisma.Decimal(l.grossPay),
          sssEmployee:         new Prisma.Decimal(l.sssEmployee),
          sssEmployer:         new Prisma.Decimal(l.sssEmployer),
          philhealthEmployee:  new Prisma.Decimal(l.philhealthEmployee),
          philhealthEmployer:  new Prisma.Decimal(l.philhealthEmployer),
          pagibigEmployee:     new Prisma.Decimal(l.pagibigEmployee),
          pagibigEmployer:     new Prisma.Decimal(l.pagibigEmployer),
          withholdingTax:      new Prisma.Decimal(l.withholdingTax),
          otherDeductions:     new Prisma.Decimal(l.otherDeductions),
          totalDeductions:     new Prisma.Decimal(l.totalDeductions),
          netPay:              new Prisma.Decimal(l.netPay),
          remarks:             l.remarks,
        })),
      },
    },
    include: { lines: { include: { employee: { select: { firstName: true, lastName: true, employeeNumber: true } } } } },
  });
}

export async function approvePayrollRun(
  organizationId: string,
  id: string,
  approvedById: string
) {
  const run = await prisma.hrPayrollRun.findFirst({ where: { id, organizationId } });
  if (!run) throw new Error("Payroll run not found");
  if (run.status !== "DRAFT") throw new Error("Only DRAFT payroll runs can be approved");

  return prisma.hrPayrollRun.update({
    where: { id },
    data: { status: "APPROVED", approvedById, approvedAt: new Date() },
  });
}

export async function markPayrollPaid(
  organizationId: string,
  id: string,
  paidById: string,
  payDate: Date
) {
  const run = await prisma.hrPayrollRun.findFirst({ where: { id, organizationId } });
  if (!run) throw new Error("Payroll run not found");
  if (run.status !== "APPROVED") throw new Error("Only APPROVED payroll runs can be marked as paid");

  return prisma.hrPayrollRun.update({
    where: { id },
    data: { status: "PAID", paidById, paidAt: new Date(), payDate },
  });
}
