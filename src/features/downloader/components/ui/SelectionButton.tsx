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
        "w-full h-auto p-3 justify-between rounded-xl border-2 transition-all",
        isSelected
          ? "border-primary bg-primary shadow-md"
          : "border-transparent hover:border-border/50 hover:bg-accent/30",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg transition-all",
            isSelected ? "bg-white/20" : "bg-muted/70 hover:bg-muted",
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
              "font-bold text-sm leading-none",
              isSelected ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "text-xs uppercase font-bold tracking-tight mt-1",
              isSelected ? "text-white/80" : "text-muted-foreground",
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
              "text-xs font-mono font-bold px-2 py-0.5 rounded",
              isSelected ? "bg-white text-primary" : "bg-muted text-foreground",
            )}
          >
            {rightLabel ?? "-"}
          </span>
        )}
        <div className="w-5 h-5 flex items-center justify-center">
          {isSelected && <Check className="w-5 h-5 stroke-[3px]" />}
        </div>
      </div>
    </Button>
  );
}
