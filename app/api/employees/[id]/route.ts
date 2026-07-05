import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { employeeInputSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUniqueOrThrow({ where: { id } });
    return NextResponse.json(employee);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = employeeInputSchema.partial().parse(await request.json());
    const employee = await prisma.employee.update({ where: { id }, data });
    return NextResponse.json(employee);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    // Shifts are kept and become unassigned via onDelete: SetNull
    await prisma.employee.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
