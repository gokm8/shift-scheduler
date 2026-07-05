"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EmployeeDialog } from "@/components/employee-dialog";
import { RoleBadge } from "@/components/role-badge";
import { useUser } from "@/components/user-provider";
import { api, ApiError } from "@/lib/api-client";
import type { Employee, EmployeeWithCount } from "@/lib/types";

export default function EmployeesPage() {
  const { employees, isManager, refreshEmployees } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<EmployeeWithCount | null>(null);

  if (!isManager) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>Kun for ledere</EmptyTitle>
          <EmptyDescription>
            Skift til Leder i menuen øverst for at administrere medarbejdere.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditing(employee);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api(`/api/employees/${deleting.id}`, { method: "DELETE" });
      toast.success(`${deleting.name} er slettet`);
      refreshEmployees();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Der opstod en fejl");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Medarbejdere</h1>
          <p className="text-sm text-muted-foreground">
            Administrér medarbejdere og deres roller.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Ny medarbejder
        </Button>
      </div>

      {employees.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Ingen medarbejdere endnu</EmptyTitle>
            <EmptyDescription>
              Opret den første medarbejder for at komme i gang med vagtplanen.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="text-right">Vagter</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.email}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={employee.role} />
                  </TableCell>
                  <TableCell className="text-right">
                    {employee._count.shifts}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Redigér ${employee.name}`}
                        onClick={() => openEdit(employee)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Slet ${employee.name}`}
                        onClick={() => setDeleting(employee)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editing}
        onSaved={refreshEmployees}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slet {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && deleting._count.shifts > 0
                ? `Medarbejderen har ${deleting._count.shifts} vagt(er), som bliver stående uden tildeling.`
                : "Handlingen kan ikke fortrydes."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annullér</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Slet</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
