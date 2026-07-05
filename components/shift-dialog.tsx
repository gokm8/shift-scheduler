"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/components/user-provider";
import { api, ApiError } from "@/lib/api-client";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import type { Role, ShiftDto } from "@/lib/types";

const UNASSIGNED = "unassigned";

type ShiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: ShiftDto | null;
  defaultRange?: { start: Date; end: Date } | null;
  onSaved: () => void;
};

export function ShiftDialog({
  open,
  onOpenChange,
  shift,
  defaultRange,
  onSaved,
}: ShiftDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{shift ? "Redigér vagt" : "Ny vagt"}</DialogTitle>
          <DialogDescription>
            {shift
              ? "Ændr tidspunkt, rolle eller tildeling."
              : "Opret en vagt og tildel eventuelt en medarbejder."}
          </DialogDescription>
        </DialogHeader>
        {/* Form state lives in a child that remounts with the dialog content */}
        <ShiftForm
          shift={shift}
          defaultRange={defaultRange}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

function ShiftForm({
  shift,
  defaultRange,
  onOpenChange,
  onSaved,
}: Omit<ShiftDialogProps, "open">) {
  const { employees } = useUser();
  const start = shift ? new Date(shift.startsAt) : defaultRange?.start;
  const end = shift ? new Date(shift.endsAt) : defaultRange?.end;

  const [date, setDate] = useState(format(start ?? new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(
    start ? format(start, "HH:mm") : "08:00"
  );
  const [endTime, setEndTime] = useState(end ? format(end, "HH:mm") : "16:00");
  const [role, setRole] = useState<Role>(shift?.role ?? "WAITER");
  const [employeeId, setEmployeeId] = useState(
    shift?.employeeId ?? UNASSIGNED
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = JSON.stringify({
        startsAt: new Date(`${date}T${startTime}`).toISOString(),
        endsAt: new Date(`${date}T${endTime}`).toISOString(),
        role,
        employeeId: employeeId === UNASSIGNED ? null : employeeId,
      });
      if (shift) {
        await api(`/api/shifts/${shift.id}`, { method: "PATCH", body });
        toast.success("Vagten er opdateret");
      } else {
        await api("/api/shifts", { method: "POST", body });
        toast.success("Vagten er oprettet");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Der opstod en fejl");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!shift) return;
    try {
      await api(`/api/shifts/${shift.id}`, { method: "DELETE" });
      toast.success("Vagten er slettet");
      setConfirmDelete(false);
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Der opstod en fejl");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="shift-date">Dato</FieldLabel>
            <Input
              id="shift-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="shift-start">Starttid</FieldLabel>
              <Input
                id="shift-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="shift-end">Sluttid</FieldLabel>
              <Input
                id="shift-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="shift-role">Rolle</FieldLabel>
            <Select
              items={ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r }))}
              value={role}
              onValueChange={(v) => v && setRole(v as Role)}
            >
              <SelectTrigger id="shift-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="shift-employee">Medarbejder</FieldLabel>
            <Select
              items={[
                { label: "Ikke tildelt", value: UNASSIGNED },
                ...employees.map((e) => ({
                  label: `${e.name} (${ROLE_LABELS[e.role]})`,
                  value: e.id,
                })),
              ]}
              value={employeeId}
              onValueChange={(v) => v && setEmployeeId(v)}
            >
              <SelectTrigger id="shift-employee" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={UNASSIGNED}>Ikke tildelt</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({ROLE_LABELS[employee.role]})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <DialogFooter className="mt-6">
          {shift && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 data-icon="inline-start" />
              Slet
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annullér
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner data-icon="inline-start" />}
            {shift ? "Gem ændringer" : "Opret vagt"}
          </Button>
        </DialogFooter>
      </form>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slet vagten?</AlertDialogTitle>
            <AlertDialogDescription>
              Handlingen kan ikke fortrydes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annullér</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Slet</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
