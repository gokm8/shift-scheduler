import { format } from "date-fns";
import { da } from "date-fns/locale";
import type { Shift } from "@prisma/client";

export function conflictMessage(conflict: Shift) {
  const day = format(conflict.startsAt, "EEEE d. MMMM", { locale: da });
  const from = format(conflict.startsAt, "HH:mm");
  const to = format(conflict.endsAt, "HH:mm");
  return `Medarbejderen har allerede en vagt ${day} kl. ${from}–${to}`;
}
