"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { api, ApiError } from "@/lib/api-client";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import type { Employee, Role } from "@/lib/types";

type EmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSaved: () => void;
};

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSaved,
}: EmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Redigér medarbejder" : "Ny medarbejder"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Opdatér medarbejderens oplysninger."
              : "Udfyld oplysningerne for den nye medarbejder."}
          </DialogDescription>
        </DialogHeader>
        {/* Form state lives in a child that remounts with the dialog content */}
        <EmployeeForm
          employee={employee}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

function EmployeeForm({
  employee,
  onOpenChange,
  onSaved,
}: Omit<EmployeeDialogProps, "open">) {
  const [name, setName] = useState(employee?.name ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [role, setRole] = useState<Role>(employee?.role ?? "WAITER");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = JSON.stringify({ name, email, role });
      if (employee) {
        await api(`/api/employees/${employee.id}`, { method: "PATCH", body });
        toast.success("Medarbejderen er opdateret");
      } else {
        await api("/api/employees", { method: "POST", body });
        toast.success("Medarbejderen er oprettet");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Der opstod en fejl");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="employee-name">Navn</FieldLabel>
          <Input
            id="employee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fx Anna Jensen"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="employee-email">E-mail</FieldLabel>
          <Input
            id="employee-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anna@firma.dk"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="employee-role">Rolle</FieldLabel>
          <Select
            items={ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r }))}
            value={role}
            onValueChange={(value) => value && setRole(value as Role)}
          >
            <SelectTrigger id="employee-role" className="w-full">
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
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Annullér
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Spinner data-icon="inline-start" />}
          {employee ? "Gem ændringer" : "Opret medarbejder"}
        </Button>
      </DialogFooter>
    </form>
  );
}
