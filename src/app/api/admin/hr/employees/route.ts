import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { listEmployees, createEmployee, getEmployeeStats } from "@/lib/repositories/hr-employee.repository";

const createSchema = z.object({
  firstName:       z.string().min(1).max(100),
  lastName:        z.string().min(1).max(100),
  middleName:      z.string().max(100).optional(),
  email:           z.string().email(),
  phone:           z.string().max(30).optional(),
  position:        z.string().min(1).max(150),
  department:      z.string().max(100).optional(),
  employmentType:  z.enum(["REGULAR","PROBATIONARY","CONTRACTUAL","PART_TIME","INTERN"]).optional(),
  hireDate:        z.string(),
  basicSalary:     z.number().positive(),
  sssNumber:       z.string().max(20).optional(),
  philhealthNumber: z.string().max(20).optional(),
  pagibigNumber:   z.string().max(20).optional(),
  tinNumber:       z.string().max(20).optional(),
  birthDate:       z.string().optional(),
  gender:          z.string().max(10).optional(),
  civilStatus:     z.string().max(20).optional(),
  address:         z.string().optional(),
  emergencyContact: z.string().max(150).optional(),
  emergencyPhone:  z.string().max(30).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);

    if (searchParams.get("stats") === "1") {
      const stats = await getEmployeeStats(guard.tenantId);
      return NextResponse.json({ success: true, data: stats, error: null });
    }

    const result = await listEmployees(guard.tenantId, {
      status:     searchParams.get("status")     ?? undefined,
      department: searchParams.get("department") ?? undefined,
      search:     searchParams.get("search")     ?? undefined,
      page:       searchParams.get("page")  ? Number(searchParams.get("page"))  : undefined,
      limit:      searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    });

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/employees]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body   = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.message },
        { status: 400 }
      );
    }

    const { hireDate, birthDate, ...rest } = parsed.data;
    const employee = await createEmployee(guard.tenantId, {
      ...rest,
      hireDate:  new Date(hireDate),
      birthDate: birthDate ? new Date(birthDate) : undefined,
    });

    return NextResponse.json({ success: true, data: employee, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/hr/employees]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("Unique constraint") ? 409 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
