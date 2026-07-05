"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ShiftCalendar } from "@/components/shift-calendar";
import { ShiftDialog } from "@/components/shift-dialog";
import { useUser } from "@/components/user-provider";
import { api, ApiError } from "@/lib/api-client";
import type { ShiftDto } from "@/lib/types";

export default function SchedulePage() {
  const { isManager, refreshEmployees } = useUser();
  const [shifts, setShifts] = useState<ShiftDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftDto | null>(null);
  const [slotRange, setSlotRange] = useState<{ start: Date; end: Date } | null>(
    null
  );

  const loadShifts = useCallback(() => {
    api<ShiftDto[]>("/api/shifts")
      .then(setShifts)
      .catch((error) =>
        toast.error(error instanceof ApiError ? error.message : "Der opstod en fejl")
      );
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  if (!isManager) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays />
          </EmptyMedia>
          <EmptyTitle>Kun for ledere</EmptyTitle>
          <EmptyDescription>
            Skift til Leder i menuen øverst for at se hele vagtplanen, eller gå
            til Mine vagter for at se dine egne.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  function openCreate() {
    setEditing(null);
    setSlotRange(null);
    setDialogOpen(true);
  }

  function openCreateFromSlot(range: { start: Date; end: Date }) {
    setEditing(null);
    setSlotRange(range);
    setDialogOpen(true);
  }

  function openEdit(shift: ShiftDto) {
    setEditing(shift);
    setSlotRange(null);
    setDialogOpen(true);
  }

  function handleSaved() {
    loadShifts();
    refreshEmployees(); // keep shift counts on the employees page in sync
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vagtplan</h1>
          <p className="text-sm text-muted-foreground">
            Klik på en vagt for at redigere, eller træk i kalenderen for at
            oprette en ny.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Ny vagt
        </Button>
      </div>

      <ShiftCalendar
        shifts={shifts}
        onSelectShift={openEdit}
        onSelectSlot={openCreateFromSlot}
      />

      <ShiftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shift={editing}
        defaultRange={slotRange}
        onSaved={handleSaved}
      />
    </div>
  );
}
