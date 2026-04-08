import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { getEmployeeById, updateEmployee } from "@/lib/repositories/hr-employee.repository";

const updateSchema = z.object({
  firstName:          z.string().min(1).max(100).optional(),
  lastName:           z.string().min(1).max(100).optional(),
  middleName:         z.string().max(100).optional(),
  phone:              z.string().max(30).optional(),
  position:           z.string().min(1).max(150).optional(),
  department:         z.string().max(100).optional(),
  employmentType:     z.enum(["REGULAR","PROBATIONARY","CONTRACTUAL","PART_TIME","INTERN"]).optional(),
  status:             z.enum(["ACTIVE","INACTIVE","RESIGNED","TERMINATED","ON_LEAVE"]).optional(),
  regularizationDate: z.string().optional(),
  separationDate:     z.string().optional(),
  separationReason:   z.string().max(300).optional(),
  sssNumber:          z.string().max(20).optional(),
  philhealthNumber:   z.string().max(20).optional(),
  pagibigNumber:      z.string().max(20).optional(),
  tinNumber:          z.string().max(20).optional(),
  birthDate:          z.string().optional(),
  gender:             z.string().max(10).optional(),
  civilStatus:        z.string().max(20).optional(),
  address:            z.string().optional(),
  emergencyContact:   z.string().max(150).optional(),
  emergencyPhone:     z.string().max(30).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const emp = await getEmployeeById(guard.tenantId, id);
    if (!emp) return NextResponse.json({ success: false, data: null, error: "Employee not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: emp, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/employees/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body   = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const { regularizationDate, separationDate, birthDate, ...rest } = parsed.data;
    const emp = await updateEmployee(guard.tenantId, id, {
      ...rest,
      ...(regularizationDate && { regularizationDate: new Date(regularizationDate) }),
      ...(separationDate     && { separationDate:     new Date(separationDate) }),
      ...(birthDate          && { birthDate:           new Date(birthDate) }),
    });

    return NextResponse.json({ success: true, data: emp, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/hr/employees/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
