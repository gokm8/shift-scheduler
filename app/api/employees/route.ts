import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { employeeInputSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { shifts: true } } },
    });
    return NextResponse.json(employees);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = employeeInputSchema.parse(await request.json());
    const employee = await prisma.employee.create({ data });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
