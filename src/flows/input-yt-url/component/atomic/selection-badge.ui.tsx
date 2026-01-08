import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SelectionBadge({
  icon,
  label,
  size,
  active,
}: {
  icon: ReactNode;
  label: string;
  size?: string | null;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all h-full flex-1 min-w-0",
        active
          ? "bg-card border-border"
          : "bg-muted/10 border-dashed opacity-40",
      )}
    >
      <div className={active ? "text-primary" : ""}>{icon}</div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold leading-none truncate">{label}</span>
        {active && size && (
          <span className="text-xs font-mono text-muted-foreground mt-0.5">
            {size}
          </span>
        )}
      </div>
    </div>
  );
}
