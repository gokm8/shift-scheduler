import { prisma } from "@/lib/prisma";
import type { Shift } from "@prisma/client";

export async function findOverlappingShift(
  employeeId: string,
  startsAt: Date,
  endsAt: Date,
  excludeShiftId?: string
): Promise<Shift | null> {
  return prisma.shift.findFirst({
    where: {
      employeeId,
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
      ...(excludeShiftId ? { id: { not: excludeShiftId } } : {}),
    },
  });
}
