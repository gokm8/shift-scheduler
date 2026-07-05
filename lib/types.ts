import type { Employee, Shift, Role } from "@prisma/client";

export type { Employee, Role };

export type EmployeeWithCount = Employee & { _count: { shifts: number } };

// API responses serialize dates as ISO strings
export type ShiftDto = Omit<Shift, "startsAt" | "endsAt"> & {
  startsAt: string;
  endsAt: string;
  employee: Employee | null;
};
