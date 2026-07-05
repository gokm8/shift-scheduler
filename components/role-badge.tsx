import { Badge } from "@/components/ui/badge";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/roles";
import type { Role } from "@/lib/types";

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: ROLE_COLORS[role] }}
      />
      {ROLE_LABELS[role]}
    </Badge>
  );
}
