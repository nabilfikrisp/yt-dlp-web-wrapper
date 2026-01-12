import { Folder, FolderOpen, Info, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getNativeDirectoryAction } from "@/server/actions/directory-picker.actions";

const STORAGE_KEY = "yt-dlp-download-path";
const DEBOUNCE_MS = 500;

interface DirectoryPickerProps {
  onPathChange: (path: string | null) => void;
}

export function DirectoryPicker({ onPathChange }: DirectoryPickerProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedPath(saved);
        onPathChange(saved);
      }
    }
  }, [onPathChange]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value.trim() || null;
    setSelectedPath(newPath || "");

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (newPath) {
        localStorage.setItem(STORAGE_KEY, newPath);
        onPathChange(newPath);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        onPathChange(null);
      }
    }, DEBOUNCE_MS);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      const newPath = selectedPath?.trim() || null;
      if (newPath) {
        localStorage.setItem(STORAGE_KEY, newPath);
        onPathChange(newPath);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        onPathChange(null);
      }
    }
  };

  const handleBrowse = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getNativeDirectoryAction();

    setIsLoading(false);

    if (result.success && result.data) {
      setSelectedPath(result.data);
      localStorage.setItem(STORAGE_KEY, result.data);
      onPathChange(result.data);
    } else if (result.error && result.error !== "Dialog cancelled") {
      setError(result.error);
    }
  };

  const handleClear = () => {
    setSelectedPath(null);
    localStorage.removeItem(STORAGE_KEY);
    onPathChange(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="space-y-4">
      <Field>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={selectedPath || ""}
              placeholder="Default: ./storage"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="pr-8"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowse}
            disabled={isLoading}
            className="w-25 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <FolderOpen className="w-4 h-4" />
                <span>Browse</span>
              </>
            )}
          </Button>
          {selectedPath && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-9 w-9"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Field>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-linear-to-r from-destructive/5 to-destructive/10 border border-destructive/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-1">
          <div className="mt-0.5 bg-destructive/15 p-1.5 rounded-lg border border-destructive/20">
            <Info className="w-3.5 h-3.5 text-destructive" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-black text-destructive/70 uppercase tracking-wider">
              Error
            </p>
            <p className="text-sm font-semibold text-destructive leading-relaxed">
              {error}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismissError}
            className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
