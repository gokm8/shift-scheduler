import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shiftCreateSchema } from "@/lib/validation";
import { findOverlappingShift } from "@/lib/overlap";
import { conflictMessage } from "@/lib/conflict";
import { errorResponse, handleApiError } from "@/lib/api-helpers";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const employeeId = searchParams.get("employeeId");

    const where: Prisma.ShiftWhereInput = {};
    if (from) where.endsAt = { gt: new Date(from) };
    if (to) where.startsAt = { lt: new Date(to) };
    if (employeeId) where.employeeId = employeeId;

    const shifts = await prisma.shift.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: { employee: true },
    });
    return NextResponse.json(shifts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = shiftCreateSchema.parse(await request.json());

    if (data.employeeId) {
      const conflict = await findOverlappingShift(
        data.employeeId,
        data.startsAt,
        data.endsAt
      );
      if (conflict) return errorResponse(conflictMessage(conflict), 409);
    }

    const shift = await prisma.shift.create({
      data: { ...data, employeeId: data.employeeId ?? null },
      include: { employee: true },
    });
    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
