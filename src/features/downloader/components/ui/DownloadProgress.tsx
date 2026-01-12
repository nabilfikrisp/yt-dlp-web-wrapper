import { AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  StreamError,
  StreamIdle,
  StreamPreparing,
  StreamProgress,
  StreamSuccess,
} from "@/shared/types/api.types";
import { calculateCurrentSize } from "../../utils/parse-progress.utils";

interface DownloadProgressProps {
  streamResult:
    | StreamPreparing
    | StreamIdle
    | StreamProgress
    | StreamSuccess
    | StreamError;
  onCancel: () => void;
  onRetry: () => void;
  onClose: () => void;
  donwloadPath: string | null;
}

export function DownloadProgress({
  streamResult,
  onCancel,
  onRetry,
  onClose,
  donwloadPath,
}: DownloadProgressProps) {
  const parsedProgress =
    streamResult.type === "progress"
      ? streamResult.raw
        ? (() => {
            try {
              const result = streamResult.raw;
              const percentageMatch = result.match(/(\d+\.\d+)%/);
              const sizeMatch = result.match(/of\s+([\d.]+\s*[KMGTP]?i?B)/i);
              const speedMatch = result.match(
                /at\s+([\d.]+\s*[KMGTP]?i?B\/s)/i,
              );
              const etaMatch = result.match(/ETA\s+(\d+:\d+)/i);

              if (!percentageMatch) return null;

              return {
                percentage: parseFloat(percentageMatch[1]),
                size: sizeMatch?.[1] || "",
                speed: speedMatch?.[1] || "",
                eta: etaMatch?.[1] || "",
              };
            } catch {
              return null;
            }
          })()
        : null
      : null;

  if (streamResult.type === "idle" || streamResult.type === "preparing") {
    return null;
  }

  if (streamResult.type === "progress" && parsedProgress) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl border bg-linear-to-b from-card/40 to-card/20 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black tabular-nums text-foreground">
                  {parsedProgress.percentage.toFixed(1)}%
                </span>
                {parsedProgress.size && (
                  <span className="text-sm text-muted-foreground font-medium">
                    (
                    {calculateCurrentSize(
                      parsedProgress.percentage,
                      parsedProgress.size,
                    )}{" "}
                    / {parsedProgress.size})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-1">
                <span className="tabular-nums">
                  {parsedProgress.speed || "00.00MiB/s"}
                </span>
                <span>•</span>
                <span className="tabular-nums">
                  ETA {parsedProgress.eta || "00:00"}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCancel}
              className="h-7 w-7 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Progress value={parsedProgress.percentage} className="h-4" />
        </div>

        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full h-12 rounded-2xl gap-2 font-semibold text-base"
        >
          Cancel Download
        </Button>
      </div>
    );
  }

  if (streamResult.type === "success") {
    return (
      <div className="p-4 rounded-xl border bg-linear-to-b from-green-500/10 to-green-500/5 backdrop-blur-sm shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider leading-tight text-green-600 dark:text-green-400/80">
              Complete
            </p>
            <p className="text-sm font-semibold mt-1 text-foreground">
              Video saved to {donwloadPath || "/storage"} folder
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 -mr-2 -mt-1"
          >
            <X className="w-4 h-4 opacity-50 hover:opacity-100" />
          </Button>
        </div>
      </div>
    );
  }

  if (streamResult.type === "error") {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl border bg-linear-to-b from-destructive/10 to-destructive/5 backdrop-blur-sm shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-wider leading-tight text-destructive/80">
                Error
              </p>
              <p className="text-sm font-semibold mt-1 text-foreground">
                {streamResult.error || "Download failed"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 -mr-2 -mt-1"
            >
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </Button>
          </div>
        </div>

        <Button
          onClick={onRetry}
          variant="outline"
          className="w-full h-12 rounded-2xl gap-2 font-semibold text-base"
        >
          <Download className="w-5 h-5" />
          Retry Download
        </Button>
      </div>
    );
  }

  return null;
}
