"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isSameDay } from "date-fns";
import { da } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarDays, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { RoleBadge } from "@/components/role-badge";
import { ShiftCalendar } from "@/components/shift-calendar";
import { useUser } from "@/components/user-provider";
import { api, ApiError } from "@/lib/api-client";
import type { ShiftDto } from "@/lib/types";

function formatShiftTime(shift: ShiftDto) {
  const start = new Date(shift.startsAt);
  const end = new Date(shift.endsAt);
  const day = format(start, "EEEE d. MMMM", { locale: da });
  const sameDay = isSameDay(start, end);
  const endPart = sameDay
    ? format(end, "HH:mm")
    : format(end, "HH:mm (d. MMM)", { locale: da });
  return `${day} · ${format(start, "HH:mm")}–${endPart}`;
}

export default function MyShiftsPage() {
  const { currentEmployee, isManager } = useUser();
  const [shifts, setShifts] = useState<ShiftDto[]>([]);

  const loadShifts = useCallback(() => {
    if (!currentEmployee) return;
    api<ShiftDto[]>(`/api/shifts?employeeId=${currentEmployee.id}`)
      .then(setShifts)
      .catch((error) =>
        toast.error(error instanceof ApiError ? error.message : "Der opstod en fejl")
      );
  }, [currentEmployee]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  if (isManager || !currentEmployee) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays />
          </EmptyMedia>
          <EmptyTitle>Vælg en medarbejder</EmptyTitle>
          <EmptyDescription>
            Vælg en medarbejder i menuen øverst for at se den personlige
            vagtplan.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const upcoming = shifts.filter(
    (shift) => new Date(shift.endsAt) >= new Date()
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mine vagter</h1>
          <p className="text-sm text-muted-foreground">
            Dine vagter, {currentEmployee.name}.
          </p>
        </div>
        <RoleBadge role={currentEmployee.role} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kommende vagter</CardTitle>
          <CardDescription>
            {upcoming.length === 0
              ? "Du har ingen kommende vagter."
              : `Du har ${upcoming.length} kommende vagt${upcoming.length === 1 ? "" : "er"}.`}
          </CardDescription>
        </CardHeader>
        {upcoming.length > 0 && (
          <CardContent>
            <ul className="flex flex-col gap-2">
              {upcoming.map((shift) => (
                <li
                  key={shift.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm first-letter:uppercase">
                    {formatShiftTime(shift)}
                  </span>
                  <span className="ml-auto">
                    <RoleBadge role={shift.role} />
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      <ShiftCalendar shifts={shifts} />
    </div>
  );
}
