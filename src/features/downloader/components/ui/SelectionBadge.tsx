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
        "flex items-center gap-2.5 px-2 py-1.5 rounded-xl border transition-all duration-300 h-full flex-1 min-w-0",
        active
          ? "bg-linear-to-br from-card to-card/50 border-border shadow-md shadow-primary/5"
          : "bg-muted/20 border-muted-foreground/15 hover:bg-muted/40 hover:border-muted-foreground/25 hover:shadow-sm cursor-pointer",
      )}
    >
      <div
        className={cn(
          "p-1 rounded-lg transition-all duration-300",
          active
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-muted-foreground/50",
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={cn(
            "text-xs font-semibold leading-none truncate transition-colors duration-300",
            active ? "text-foreground" : "text-muted-foreground/70",
          )}
        >
          {label}
        </span>
        {active && size && (
          <span className="text-xs font-mono text-muted-foreground mt-0.5 bg-muted/30 px-1.5 py-0.5 rounded text-center">
            {size}
          </span>
        )}
      </div>
    </div>
  );
}
