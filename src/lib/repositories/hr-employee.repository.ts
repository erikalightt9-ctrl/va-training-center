import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface CreateEmployeeInput {
  employeeNumber?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  employmentType?: "REGULAR" | "PROBATIONARY" | "CONTRACTUAL" | "PART_TIME" | "INTERN";
  hireDate: Date;
  basicSalary: number;
  // Government IDs
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  tinNumber?: string;
  // Personal
  birthDate?: Date;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  address?: string;           // kept for compat → maps to presentAddress
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  // Compensation
  allowance?: number;
  payrollType?: string;
  // Employment
  remarks?: string;
  // Portal access
  isPortalEnabled?: boolean;
  portalRole?: "EMPLOYEE" | "DRIVER" | "MANAGER";
  passwordHash?: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  position?: string;
  department?: string;
  employmentType?: "REGULAR" | "PROBATIONARY" | "CONTRACTUAL" | "PART_TIME" | "INTERN";
  status?: "ACTIVE" | "INACTIVE" | "RESIGNED" | "TERMINATED" | "ON_LEAVE";
  regularizationDate?: Date;
  separationDate?: Date;
  separationReason?: string;
  lastWorkingDate?: Date;
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  tinNumber?: string;
  birthDate?: Date;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  address?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  allowance?: number;
  payrollType?: string;
  remarks?: string;
}

export interface CreateDocumentInput {
  fileUrl: string;
  fileType: string;
  documentType: string;
  label: string;
  fileSize?: number;
  uploadedById?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

async function getNextEmployeeNumber(organizationId: string): Promise<string> {
  const count = await prisma.hrEmployee.count({ where: { organizationId } });
  return `EMP-${String(count + 1).padStart(5, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Queries                                                             */
/* ------------------------------------------------------------------ */

export async function listEmployees(
  organizationId: string,
  filters: {
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;

  const where: Prisma.HrEmployeeWhereInput = {
    organizationId,
    ...(filters.status     && { status: filters.status as never }),
    ...(filters.department && { department: filters.department }),
    ...(filters.search && {
      OR: [
        { firstName:      { contains: filters.search, mode: "insensitive" } },
        { lastName:       { contains: filters.search, mode: "insensitive" } },
        { email:          { contains: filters.search, mode: "insensitive" } },
        { employeeNumber: { contains: filters.search, mode: "insensitive" } },
        { position:       { contains: filters.search, mode: "insensitive" } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.hrEmployee.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        contracts: {
          where: { isCurrent: true },
          select: { basicSalary: true, contractType: true },
          take: 1,
        },
      },
    }),
    prisma.hrEmployee.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getEmployeeById(organizationId: string, id: string) {
  return prisma.hrEmployee.findFirst({
    where: { id, organizationId },
    include: {
      contracts: { orderBy: { startDate: "desc" } },
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      documents: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getEmployeeStats(organizationId: string) {
  const [active, onLeave, inactive] = await Promise.all([
    prisma.hrEmployee.count({ where: { organizationId, status: "ACTIVE" } }),
    prisma.hrEmployee.count({ where: { organizationId, status: "ON_LEAVE" } }),
    prisma.hrEmployee.count({ where: { organizationId, status: { in: ["INACTIVE", "RESIGNED", "TERMINATED"] } } }),
  ]);

  const byDept = await prisma.hrEmployee.groupBy({
    by: ["department"],
    where: { organizationId, status: "ACTIVE" },
    _count: true,
  });

  return { active, onLeave, inactive, total: active + onLeave + inactive, byDept };
}

export async function listResignedEmployees(organizationId: string) {
  return prisma.hrEmployee.findMany({
    where: { organizationId, status: { in: ["RESIGNED", "TERMINATED"] } },
    orderBy: [{ separationDate: "desc" }, { lastName: "asc" }],
    include: {
      contracts: {
        where: { isCurrent: true },
        select: { basicSalary: true },
        take: 1,
      },
    },
  });
}

export async function listAllActiveForExport(organizationId: string) {
  return prisma.hrEmployee.findMany({
    where: { organizationId, status: { not: "TERMINATED" } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      contracts: {
        where: { isCurrent: true },
        select: { basicSalary: true },
        take: 1,
      },
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                           */
/* ------------------------------------------------------------------ */

export async function createEmployee(
  organizationId: string,
  data: CreateEmployeeInput
) {
  const employeeNumber = data.employeeNumber ?? await getNextEmployeeNumber(organizationId);
  const presentAddr    = data.presentAddress ?? data.address ?? null;

  return prisma.hrEmployee.create({
    data: {
      organizationId,
      employeeNumber,
      firstName:      data.firstName,
      lastName:       data.lastName,
      middleName:     data.middleName          ?? null,
      email:          data.email,
      phone:          data.phone               ?? null,
      position:       data.position,
      department:     data.department          ?? null,
      employmentType: data.employmentType      ?? "REGULAR",
      hireDate:       data.hireDate,
      sssNumber:      data.sssNumber           ?? null,
      philhealthNumber: data.philhealthNumber  ?? null,
      pagibigNumber:  data.pagibigNumber       ?? null,
      tinNumber:      data.tinNumber           ?? null,
      birthDate:      data.birthDate           ?? null,
      gender:         data.gender              ?? null,
      civilStatus:    data.civilStatus         ?? null,
      nationality:    data.nationality         ?? null,
      address:        presentAddr,
      presentAddress: presentAddr,
      permanentAddress: data.permanentAddress  ?? null,
      emergencyContact: data.emergencyContact  ?? null,
      emergencyPhone: data.emergencyPhone      ?? null,
      emergencyRelationship: data.emergencyRelationship ?? null,
      allowance:      data.allowance != null ? new Prisma.Decimal(data.allowance) : null,
      payrollType:    data.payrollType         ?? "MONTHLY",
      remarks:        data.remarks             ?? null,
      isPortalEnabled: data.isPortalEnabled    ?? false,
      portalRole:      (data.portalRole ?? "EMPLOYEE") as never,
      passwordHash:    data.passwordHash       ?? null,
      mustChangePassword: data.passwordHash ? true : false,
      contracts: {
        create: {
          contractType:    data.employmentType ?? "REGULAR",
          basicSalary:     new Prisma.Decimal(data.basicSalary),
          salaryFrequency: "MONTHLY",
          startDate:       data.hireDate,
          isCurrent:       true,
        },
      },
    },
    include: { contracts: true },
  });
}

export async function updateEmployee(
  organizationId: string,
  id: string,
  data: UpdateEmployeeInput
) {
  const employee = await prisma.hrEmployee.findFirst({ where: { id, organizationId } });
  if (!employee) throw new Error("Employee not found");

  const presentAddr = data.presentAddress ?? data.address;

  return prisma.hrEmployee.update({
    where: { id },
    data: {
      ...(data.firstName              !== undefined && { firstName: data.firstName }),
      ...(data.lastName               !== undefined && { lastName: data.lastName }),
      ...(data.middleName             !== undefined && { middleName: data.middleName }),
      ...(data.phone                  !== undefined && { phone: data.phone }),
      ...(data.position               !== undefined && { position: data.position }),
      ...(data.department             !== undefined && { department: data.department }),
      ...(data.employmentType         !== undefined && { employmentType: data.employmentType }),
      ...(data.status                 !== undefined && { status: data.status }),
      ...(data.regularizationDate     !== undefined && { regularizationDate: data.regularizationDate }),
      ...(data.separationDate         !== undefined && { separationDate: data.separationDate }),
      ...(data.separationReason       !== undefined && { separationReason: data.separationReason }),
      ...(data.lastWorkingDate        !== undefined && { lastWorkingDate: data.lastWorkingDate }),
      ...(data.sssNumber              !== undefined && { sssNumber: data.sssNumber }),
      ...(data.philhealthNumber       !== undefined && { philhealthNumber: data.philhealthNumber }),
      ...(data.pagibigNumber          !== undefined && { pagibigNumber: data.pagibigNumber }),
      ...(data.tinNumber              !== undefined && { tinNumber: data.tinNumber }),
      ...(data.birthDate              !== undefined && { birthDate: data.birthDate }),
      ...(data.gender                 !== undefined && { gender: data.gender }),
      ...(data.civilStatus            !== undefined && { civilStatus: data.civilStatus }),
      ...(data.nationality            !== undefined && { nationality: data.nationality }),
      ...(presentAddr                 !== undefined && { address: presentAddr, presentAddress: presentAddr }),
      ...(data.permanentAddress       !== undefined && { permanentAddress: data.permanentAddress }),
      ...(data.emergencyContact       !== undefined && { emergencyContact: data.emergencyContact }),
      ...(data.emergencyPhone         !== undefined && { emergencyPhone: data.emergencyPhone }),
      ...(data.emergencyRelationship  !== undefined && { emergencyRelationship: data.emergencyRelationship }),
      ...(data.allowance              !== undefined && { allowance: new Prisma.Decimal(data.allowance) }),
      ...(data.payrollType            !== undefined && { payrollType: data.payrollType }),
      ...(data.remarks                !== undefined && { remarks: data.remarks }),
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Documents                                                           */
/* ------------------------------------------------------------------ */

export async function listEmployeeDocuments(organizationId: string, employeeId: string) {
  return prisma.hrEmployeeDocument.findMany({
    where: { organizationId, employeeId, isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEmployeeDocument(
  organizationId: string,
  employeeId: string,
  data: CreateDocumentInput
) {
  const emp = await prisma.hrEmployee.findFirst({ where: { id: employeeId, organizationId } });
  if (!emp) throw new Error("Employee not found");

  return prisma.hrEmployeeDocument.create({
    data: {
      organizationId,
      employeeId,
      fileUrl:      data.fileUrl,
      fileType:     data.fileType,
      documentType: data.documentType,
      label:        data.label,
      fileSize:     data.fileSize ?? null,
      uploadedById: data.uploadedById ?? null,
    },
  });
}

export async function softDeleteDocument(
  organizationId: string,
  employeeId: string,
  docId: string
) {
  const doc = await prisma.hrEmployeeDocument.findFirst({
    where: { id: docId, organizationId, employeeId },
  });
  if (!doc) throw new Error("Document not found");

  return prisma.hrEmployeeDocument.update({
    where: { id: docId },
    data: { isDeleted: true },
  });
}
