import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SelectionBadgeProps {
  icon: ReactNode;
  label: string;
  size?: string | null;
  active: boolean;
}

export function SelectionBadge({
  icon,
  label,
  size,
  active,
}: SelectionBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all h-full flex-1 min-w-0",
        active
          ? "bg-card border-border shadow-sm"
          : "bg-muted/30 border-muted-foreground/20 hover:bg-muted/50 hover:border-muted-foreground/30 cursor-pointer",
      )}
    >
      <div className={cn(active ? "text-primary" : "text-muted-foreground/60")}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={cn(
            "text-xs font-bold leading-none truncate",
            active ? "text-foreground" : "text-muted-foreground/80",
          )}
        >
          {label}
        </span>
        {active && size && (
          <span className="text-xs font-mono text-muted-foreground mt-0.5">
            {size}
          </span>
        )}
      </div>
    </div>
  );
}
