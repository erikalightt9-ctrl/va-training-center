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
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
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
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  tinNumber?: string;
  birthDate?: Date;
  gender?: string;
  civilStatus?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
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

/* ------------------------------------------------------------------ */
/*  Mutations                                                           */
/* ------------------------------------------------------------------ */

export async function createEmployee(
  organizationId: string,
  data: CreateEmployeeInput
) {
  const employeeNumber = data.employeeNumber ?? await getNextEmployeeNumber(organizationId);

  return prisma.hrEmployee.create({
    data: {
      organizationId,
      employeeNumber,
      firstName:      data.firstName,
      lastName:       data.lastName,
      middleName:     data.middleName     ?? null,
      email:          data.email,
      phone:          data.phone          ?? null,
      position:       data.position,
      department:     data.department     ?? null,
      employmentType: data.employmentType ?? "REGULAR",
      hireDate:       data.hireDate,
      sssNumber:      data.sssNumber      ?? null,
      philhealthNumber: data.philhealthNumber ?? null,
      pagibigNumber:  data.pagibigNumber  ?? null,
      tinNumber:      data.tinNumber      ?? null,
      birthDate:      data.birthDate      ?? null,
      gender:         data.gender         ?? null,
      civilStatus:    data.civilStatus    ?? null,
      address:        data.address        ?? null,
      emergencyContact: data.emergencyContact ?? null,
      emergencyPhone: data.emergencyPhone ?? null,
      isPortalEnabled: data.isPortalEnabled ?? false,
      portalRole:      (data.portalRole ?? "EMPLOYEE") as never,
      passwordHash:    data.passwordHash ?? null,
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

  return prisma.hrEmployee.update({
    where: { id },
    data: {
      ...(data.firstName          !== undefined && { firstName: data.firstName }),
      ...(data.lastName           !== undefined && { lastName: data.lastName }),
      ...(data.middleName         !== undefined && { middleName: data.middleName }),
      ...(data.phone              !== undefined && { phone: data.phone }),
      ...(data.position           !== undefined && { position: data.position }),
      ...(data.department         !== undefined && { department: data.department }),
      ...(data.employmentType     !== undefined && { employmentType: data.employmentType }),
      ...(data.status             !== undefined && { status: data.status }),
      ...(data.regularizationDate !== undefined && { regularizationDate: data.regularizationDate }),
      ...(data.separationDate     !== undefined && { separationDate: data.separationDate }),
      ...(data.separationReason   !== undefined && { separationReason: data.separationReason }),
      ...(data.sssNumber          !== undefined && { sssNumber: data.sssNumber }),
      ...(data.philhealthNumber   !== undefined && { philhealthNumber: data.philhealthNumber }),
      ...(data.pagibigNumber      !== undefined && { pagibigNumber: data.pagibigNumber }),
      ...(data.tinNumber          !== undefined && { tinNumber: data.tinNumber }),
      ...(data.birthDate          !== undefined && { birthDate: data.birthDate }),
      ...(data.gender             !== undefined && { gender: data.gender }),
      ...(data.civilStatus        !== undefined && { civilStatus: data.civilStatus }),
      ...(data.address            !== undefined && { address: data.address }),
      ...(data.emergencyContact   !== undefined && { emergencyContact: data.emergencyContact }),
      ...(data.emergencyPhone     !== undefined && { emergencyPhone: data.emergencyPhone }),
    },
  });
}
