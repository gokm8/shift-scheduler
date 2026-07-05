"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, UserRound, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MANAGER, useUser } from "@/components/user-provider";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { employees, currentUserId, isManager, selectUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const links = isManager
    ? [
        { href: "/", label: "Vagtplan", icon: CalendarDays },
        { href: "/employees", label: "Medarbejdere", icon: Users },
      ]
    : [{ href: "/my-shifts", label: "Mine vagter", icon: CalendarDays }];

  function handleSelectUser(id: string | null) {
    if (!id) return;
    selectUser(id);
    router.push(id === MANAGER ? "/" : "/my-shifts");
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CalendarDays className="size-5 text-primary" />
          Vagtplan
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                pathname === href
                  ? "bg-accent font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <UserRound className="size-4 text-muted-foreground" />
          <Select
            items={[
              { label: "Leder", value: MANAGER },
              ...employees.map((e) => ({ label: e.name, value: e.id })),
            ]}
            value={currentUserId}
            onValueChange={handleSelectUser}
          >
            <SelectTrigger className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Vis som</SelectLabel>
                <SelectItem value={MANAGER}>Leder</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
