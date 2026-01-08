import { Check, Languages, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelectionButtonProps {
  isSelected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  rightLabel?: string | null;
}

export function SelectionButton({
  isSelected,
  onClick,
  title,
  desc,
  rightLabel,
}: SelectionButtonProps) {
  return (
    <Button
      variant={isSelected ? "default" : "ghost"}
      className={cn(
        "w-full h-auto p-3 justify-between rounded-xl border-2 transition-all duration-300 group",
        isSelected
          ? "border-primary bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/25"
          : "border-transparent hover:border-border/50 hover:bg-accent/30 hover:shadow-md",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg transition-all duration-300",
            isSelected
              ? "bg-white/20 shadow-inner"
              : "bg-muted/70 hover:bg-muted hover:scale-105",
          )}
        >
          {rightLabel === "AI" || rightLabel === "HQ" ? (
            <Languages className="w-4 h-4" />
          ) : (
            <Monitor className="w-4 h-4" />
          )}
        </div>
        <div className="flex flex-col items-start">
          <span
            className={cn(
              "font-bold text-sm leading-none transition-colors duration-300",
              isSelected ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "text-xs uppercase font-bold tracking-tight mt-1 transition-colors duration-300",
              isSelected ? "text-white/90" : "text-muted-foreground",
            )}
          >
            {desc}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {rightLabel && (
          <span
            className={cn(
              "text-xs font-mono font-bold px-2 py-0.5 rounded transition-all duration-300",
              isSelected
                ? "bg-white/90 text-primary shadow-inner"
                : "bg-muted/60 text-foreground group-hover:bg-muted group-hover:scale-105",
            )}
          >
            {rightLabel ?? "-"}
          </span>
        )}
        <div
          className={cn(
            "w-6 h-6 flex items-center justify-center transition-all duration-300",
            isSelected
              ? "scale-110"
              : "scale-100 opacity-0 group-hover:opacity-50",
          )}
        >
          <Check
            className={cn(
              "w-5 h-5 stroke-[3px] transition-all duration-300",
              isSelected ? "text-white opacity-100" : "text-muted-foreground",
            )}
          />
        </div>
      </div>
    </Button>
  );
}
