import type { ReactNode } from "react";
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabTriggerProps {
  value: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

export function TabTrigger({ value, icon, label, active }: TabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-lg gap-2 text-xs font-bold uppercase flex-1 transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/50 data-[state=active]:hover:bg-background"
    >
      <span
        className={cn(
          "transition-all duration-300",
          active ? "scale-110" : "scale-100 opacity-70",
        )}
      >
        {icon}
      </span>
      <span className="transition-colors duration-300">{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
      )}
    </TabsTrigger>
  );
}
