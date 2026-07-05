import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  CHEF: "Kok",
  WAITER: "Tjener",
  DISHWASHER: "Opvasker",
  MANAGER: "Leder",
};

export const ROLES = Object.keys(ROLE_LABELS) as Role[];

// Calendar event + badge accent colors per role (Tailwind-compatible values)
export const ROLE_COLORS: Record<Role, string> = {
  CHEF: "#e11d48",
  WAITER: "#2563eb",
  DISHWASHER: "#059669",
  MANAGER: "#7c3aed",
};
