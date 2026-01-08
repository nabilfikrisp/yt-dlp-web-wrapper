import { useState } from "react";
import type { VideoMetadata } from "../types/video-metadata.types";
import { DownloaderForm } from "./DownloaderForm";

export function DownloaderPage() {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMetadata(null);
    setError(null);
  }

  return (
    <div
      className={`min-h-dvh w-full flex flex-col items-center bg-background px-6 transition-all duration-500 ease-in-out ${metadata ? "py-12" : "justify-center"}`}
    >
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {!metadata && (
          <div className="text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-4xl font-extrabold tracking-tight italic">
              YT-DLP
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Web Extractor
            </p>
          </div>
        )}

        <DownloaderForm
          metadata={metadata}
          setMetadata={setMetadata}
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          error={error}
          setError={setError}
          reset={reset}
        />

        {!metadata && (
          <p className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
            yt-dlp web extractor
          </p>
        )}
      </div>
    </div>
  );
}
