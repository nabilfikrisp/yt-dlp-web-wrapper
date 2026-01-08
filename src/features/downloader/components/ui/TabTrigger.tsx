import type { ReactNode } from "react";
import { TabsTrigger } from "@/components/ui/tabs";

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
      className="rounded-lg gap-2 text-xs font-bold uppercase flex-1 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
    >
      {icon} {label}{" "}
      {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
    </TabsTrigger>
  );
}
