import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shiftUpdateSchema } from "@/lib/validation";
import { findOverlappingShift } from "@/lib/overlap";
import { conflictMessage } from "@/lib/conflict";
import { errorResponse, handleApiError } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const shift = await prisma.shift.findUniqueOrThrow({
      where: { id },
      include: { employee: true },
    });
    return NextResponse.json(shift);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = shiftUpdateSchema.parse(await request.json());

    const existing = await prisma.shift.findUniqueOrThrow({ where: { id } });

    // Validate the resulting shift (existing values merged with the update)
    const employeeId =
      data.employeeId !== undefined ? data.employeeId : existing.employeeId;
    const startsAt = data.startsAt ?? existing.startsAt;
    const endsAt = data.endsAt ?? existing.endsAt;

    if (endsAt <= startsAt) {
      return errorResponse("Sluttid skal være efter starttid", 400);
    }

    if (employeeId) {
      const conflict = await findOverlappingShift(employeeId, startsAt, endsAt, id);
      if (conflict) return errorResponse(conflictMessage(conflict), 409);
    }

    const shift = await prisma.shift.update({
      where: { id },
      data,
      include: { employee: true },
    });
    return NextResponse.json(shift);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    await prisma.shift.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
