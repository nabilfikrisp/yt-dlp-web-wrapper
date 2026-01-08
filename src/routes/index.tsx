import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DownloaderForm } from "@/features/downloader/components/DownloaderForm";
import { MetadataDisplay } from "@/features/downloader/components/MetadataDisplay";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import {
  getVideoMetadataAction,
  getYTVersionAction,
} from "@/server/actions/downloader.actions";

export const Route = createFileRoute("/")({
  component: DownloaderPage,
  loader: async () => {
    const res = await getYTVersionAction();
    return {
      version: res.success ? res.data : null,
    };
  },
});

function DownloaderPage() {
  const { version } = Route.useLoaderData();
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

  console.log(metadata);
  return (
    <div
      className={`min-h-dvh w-full flex flex-col items-center px-6 transition-all duration-500 ease-in-out ${metadata ? "py-8" : "justify-center"}`}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6">
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
          showReset={!!metadata}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          onReset={handleReset}
          onDismissError={handleDismissError}
        />

        {metadata && <MetadataDisplay data={metadata} videoUrl={videoUrl} />}

        {!metadata && (
          <p className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
            {version ? `v${version} • stable engine` : "yt-dlp not detected"}
          </p>
        )}
      </div>
    </div>
  );
}
