import type { ReactNode } from "react";
import { TabsTrigger } from "@/components/ui/tabs";

export function TabTrigger({
  value,
  icon,
  label,
  active,
}: {
  value: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-lg gap-2 text-xs font-bold uppercase flex-1 transition-all"
    >
      {icon} {label}{" "}
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}
    </TabsTrigger>
  );
}
