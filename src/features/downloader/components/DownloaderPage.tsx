import { useState } from "react";
import { getVideoMetadataAction } from "@/server/actions/downloader.actions";
import type { VideoMetadata } from "../types/video-metadata.types";
import { DownloaderForm } from "./DownloaderForm";
import { MetadataDisplay } from "./MetadataDisplay";

export function DownloaderPage() {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setMetadata(null);
    setVideoUrl("");
    setError(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleSubmit = async (url: string) => {
    setIsSubmitting(true);
    setError(null);

    const res = await getVideoMetadataAction({ data: { url } });

    if (!res.success) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    setMetadata(res.data);
    setVideoUrl(url);
    setIsSubmitting(false);
  };

  return (
    <div
      className={`min-h-dvh w-full flex flex-col items-center bg-background px-6 transition-all duration-500 ease-in-out ${metadata ? "py-12" : "justify-center"}`}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {!metadata && (
          <div className="text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-3xl font-medium tracking-tight">YT-DLP</h1>
            <p className="text-muted-foreground text-sm">Web Extractor</p>
          </div>
        )}

        <DownloaderForm
          showReset={!!metadata}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          onReset={handleReset}
          onDismissError={handleDismissError}
        />

        {metadata && <MetadataDisplay data={metadata} videoUrl={videoUrl} />}
      </div>
    </div>
  );
}
