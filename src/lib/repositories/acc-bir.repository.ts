import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Tax Rules                                                           */
/* ------------------------------------------------------------------ */

export interface CreateTaxRuleInput {
  code: string;
  name: string;
  rate: number;
  taxType: "VAT" | "WITHHOLDING" | "INCOME";
  description?: string;
}

export async function listTaxRules(organizationId: string) {
  return prisma.accTaxRule.findMany({
    where: { organizationId },
    orderBy: [{ taxType: "asc" }, { code: "asc" }],
  });
}

export async function createTaxRule(
  organizationId: string,
  data: CreateTaxRuleInput
) {
  return prisma.accTaxRule.create({
    data: {
      organizationId,
      code: data.code.toUpperCase(),
      name: data.name,
      rate: new Prisma.Decimal(data.rate),
      taxType: data.taxType,
      description: data.description ?? null,
    },
  });
}

export async function updateTaxRule(
  organizationId: string,
  id: string,
  data: Partial<CreateTaxRuleInput> & { isActive?: boolean }
) {
  const rule = await prisma.accTaxRule.findFirst({ where: { id, organizationId } });
  if (!rule) throw new Error("Tax rule not found");

  return prisma.accTaxRule.update({
    where: { id },
    data: {
      ...(data.name        !== undefined && { name: data.name }),
      ...(data.rate        !== undefined && { rate: new Prisma.Decimal(data.rate) }),
      ...(data.taxType     !== undefined && { taxType: data.taxType }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive    !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function seedDefaultPhTaxRules(organizationId: string) {
  const defaults: CreateTaxRuleInput[] = [
    // VAT
    { code: "VAT_12",        name: "VAT 12%",                  rate: 12,  taxType: "VAT",         description: "Standard PH VAT rate" },
    { code: "VAT_ZERO",      name: "Zero-Rated VAT",           rate: 0,   taxType: "VAT",         description: "Export sales and other zero-rated transactions" },
    { code: "VAT_EXEMPT",    name: "VAT Exempt",               rate: 0,   taxType: "VAT",         description: "Non-VAT transactions" },
    // Expanded Withholding Tax (EWT)
    { code: "EWT_PROF_10",   name: "EWT – Professional 10%",   rate: 10,  taxType: "WITHHOLDING", description: "BIR ATC WC010 – professionals/talent fees" },
    { code: "EWT_PROF_15",   name: "EWT – Professional 15%",   rate: 15,  taxType: "WITHHOLDING", description: "BIR ATC WC160 – professionals >₱3M" },
    { code: "EWT_RENT_5",    name: "EWT – Rent 5%",            rate: 5,   taxType: "WITHHOLDING", description: "BIR ATC WC030 – lease of real/personal property" },
    { code: "EWT_CONTRACTOR_2", name: "EWT – Contractor 2%",  rate: 2,   taxType: "WITHHOLDING", description: "BIR ATC WC140 – general engineering/building contractors" },
    { code: "EWT_SERVICES_2",   name: "EWT – Services 2%",    rate: 2,   taxType: "WITHHOLDING", description: "BIR ATC WC100 – services rendered by corporations" },
    { code: "EWT_SERVICES_10",  name: "EWT – Services 10%",   rate: 10,  taxType: "WITHHOLDING", description: "BIR ATC WC100 – services by individuals" },
    { code: "EWT_PURCHASES_1",  name: "EWT – Purchases 1%",   rate: 1,   taxType: "WITHHOLDING", description: "BIR ATC WI010 – purchase of goods from top withholding agents" },
  ];

  for (const rule of defaults) {
    await prisma.accTaxRule.upsert({
      where: { organizationId_code: { organizationId, code: rule.code } },
      update: {},
      create: {
        organizationId,
        code: rule.code,
        name: rule.name,
        rate: new Prisma.Decimal(rule.rate),
        taxType: rule.taxType,
        description: rule.description ?? null,
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Official Receipts                                                   */
/* ------------------------------------------------------------------ */

async function getNextOrNumber(organizationId: string): Promise<string> {
  const count = await prisma.accOfficialReceipt.count({ where: { organizationId } });
  const year  = new Date().getFullYear();
  return `OR-${year}-${String(count + 1).padStart(6, "0")}`;
}

export async function listOfficialReceipts(
  organizationId: string,
  filters: { invoiceId?: string; status?: string; page?: number; limit?: number }
) {
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;

  const where: Prisma.AccOfficialReceiptWhereInput = {
    organizationId,
    ...(filters.invoiceId && { invoiceId: filters.invoiceId }),
    ...(filters.status    && { status: filters.status as never }),
  };

  const [data, total] = await Promise.all([
    prisma.accOfficialReceipt.findMany({
      where,
      include: { invoice: { select: { invoiceNumber: true, customerName: true, totalAmount: true } } },
      orderBy: { issuedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.accOfficialReceipt.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function issueOfficialReceipt(
  organizationId: string,
  invoiceId: string,
  issuedById?: string
) {
  const invoice = await prisma.accInvoice.findFirst({
    where: { id: invoiceId, organizationId },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status !== "PAID") {
    throw new Error("Official Receipts can only be issued for PAID invoices");
  }

  const existing = await prisma.accOfficialReceipt.findFirst({
    where: { invoiceId, status: "ISSUED" },
  });
  if (existing) throw new Error("An active OR already exists for this invoice");

  const orNumber = await getNextOrNumber(organizationId);
  return prisma.accOfficialReceipt.create({
    data: {
      organizationId,
      orNumber,
      invoiceId,
      issuedById: issuedById ?? null,
      status: "ISSUED",
    },
    include: { invoice: { select: { invoiceNumber: true, customerName: true, totalAmount: true } } },
  });
}

export async function voidOfficialReceipt(
  organizationId: string,
  id: string,
  reason: string,
  voidedById?: string
) {
  const or = await prisma.accOfficialReceipt.findFirst({
    where: { id, organizationId },
  });
  if (!or) throw new Error("Official Receipt not found");
  if (or.status === "VOIDED") throw new Error("Already voided");

  return prisma.accOfficialReceipt.update({
    where: { id },
    data: {
      status:       "VOIDED",
      voidedAt:     new Date(),
      voidedReason: reason,
      voidedById:   voidedById ?? null,
    },
  });
}

/* ------------------------------------------------------------------ */
/*  BIR VAT Summary Report (BIR Form 2550M/2550Q)                      */
/* ------------------------------------------------------------------ */

export async function getBirVatSummary(
  organizationId: string,
  dateFrom: Date,
  dateTo: Date
) {
  // Sales side — invoices with VAT breakdown from invoice lines
  const invoiceLines = await prisma.accInvoiceLine.findMany({
    where: {
      invoice: {
        organizationId,
        status: { in: ["PAID", "PARTIALLY_PAID", "SENT"] },
        issueDate: { gte: dateFrom, lte: dateTo },
      },
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          customerName: true,
          customerTin: true,
          issueDate: true,
        },
      },
    },
  });

  type VatBucket = { taxableAmount: number; vatAmount: number; count: number };
  const salesBuckets: Record<string, VatBucket> = {
    VAT_12:    { taxableAmount: 0, vatAmount: 0, count: 0 },
    ZERO_RATED: { taxableAmount: 0, vatAmount: 0, count: 0 },
    VAT_EXEMPT: { taxableAmount: 0, vatAmount: 0, count: 0 },
  };

  for (const line of invoiceLines) {
    const vatType = line.birVatType ?? "VAT_12";
    const amount  = Number(line.amount);
    const taxAmt  = Number(line.taxRate) > 0 ? amount * (Number(line.taxRate) / 100) : 0;
    salesBuckets[vatType].taxableAmount += amount;
    salesBuckets[vatType].vatAmount     += taxAmt;
    salesBuckets[vatType].count         += 1;
  }

  // Purchase side — VAT input from expenses
  const expenses = await prisma.accExpense.findMany({
    where: {
      organizationId,
      status: { in: ["APPROVED", "PAID"] },
      expenseDate: { gte: dateFrom, lte: dateTo },
    },
    select: {
      expenseNumber: true,
      vendor: true,
      vendorTin: true,
      expenseDate: true,
      amount: true,
      taxAmount: true,
    },
  });

  const totalInputVat     = expenses.reduce((s, e) => s + Number(e.taxAmount), 0);
  const totalInputTaxable = expenses.reduce((s, e) => s + Number(e.amount),    0);

  const outputVat = salesBuckets["VAT_12"].vatAmount;
  const vatPayable = outputVat - totalInputVat;

  return {
    period: { dateFrom, dateTo },
    sales: {
      vat12:    salesBuckets["VAT_12"],
      zeroRated: salesBuckets["ZERO_RATED"],
      exempt:    salesBuckets["VAT_EXEMPT"],
      totalOutputVat: outputVat,
    },
    purchases: {
      totalTaxableAmount: totalInputTaxable,
      totalInputVat,
      details: expenses,
    },
    vatPayable: Math.max(vatPayable, 0),
    excessInputVat: vatPayable < 0 ? Math.abs(vatPayable) : 0,
  };
}

/* ------------------------------------------------------------------ */
/*  BIR Withholding Tax Report (EWT Summary)                           */
/* ------------------------------------------------------------------ */

export async function getBirWithholdingReport(
  organizationId: string,
  dateFrom: Date,
  dateTo: Date
) {
  const expenses = await prisma.accExpense.findMany({
    where: {
      organizationId,
      status: { in: ["APPROVED", "PAID"] },
      expenseDate: { gte: dateFrom, lte: dateTo },
      withholdingTaxRate: { not: null },
    },
    select: {
      id: true,
      expenseNumber: true,
      vendor: true,
      vendorTin: true,
      expenseDate: true,
      amount: true,
      withholdingTaxRate: true,
      withholdingTaxAmount: true,
      category: true,
    },
    orderBy: { expenseDate: "asc" },
  });

  // Group by vendor for the summary
  type VendorEntry = {
    vendor: string;
    tin: string | null;
    totalTaxBase: number;
    totalWithheld: number;
    transactions: number;
  };
  const byVendor = new Map<string, VendorEntry>();

  for (const e of expenses) {
    const key    = e.vendor;
    const withheld = Number(e.withholdingTaxAmount ?? 0);
    const base     = Number(e.amount);

    if (!byVendor.has(key)) {
      byVendor.set(key, {
        vendor: e.vendor,
        tin: e.vendorTin,
        totalTaxBase: 0,
        totalWithheld: 0,
        transactions: 0,
      });
    }
    const entry = byVendor.get(key)!;
    entry.totalTaxBase   += base;
    entry.totalWithheld  += withheld;
    entry.transactions   += 1;
  }

  const vendors       = Array.from(byVendor.values()).sort((a, b) => a.vendor.localeCompare(b.vendor));
  const totalTaxBase  = vendors.reduce((s, v) => s + v.totalTaxBase,  0);
  const totalWithheld = vendors.reduce((s, v) => s + v.totalWithheld, 0);

  return {
    period: { dateFrom, dateTo },
    details: expenses,
    summary: vendors,
    totalTaxBase,
    totalWithheld,
  };
}
