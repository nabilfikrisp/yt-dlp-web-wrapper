import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MetadataDisplay } from "@/features/downloader/components/MetadataDisplay";
import { VideoURLForm } from "@/features/downloader/components/VideoURLForm";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import {
  getUnfinishedDownloadsAction,
  getVideoMetadataAction,
  getYTVersionAction,
} from "@/server/actions";

export const Route = createFileRoute("/")({
  component: DownloaderPage,
  loader: async () => {
    const res = await getYTVersionAction();
    const unfinishedDownloads = await getUnfinishedDownloadsAction();
    return {
      version: res.success ? res.data : null,
      unfinishedDownloads: unfinishedDownloads.data || [],
    };
  },
});

function DownloaderPage() {
  const { version, unfinishedDownloads } = Route.useLoaderData();
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleReset = () => {
    setMetadata(null);
    setVideoUrl("");
    setError(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleDownloadStateChange = (downloading: boolean) => {
    setIsDownloading(downloading);
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
      className={`min-h-dvh w-full flex flex-col items-center px-6 transition-all duration-500 ease-in-out ${metadata ? "py-6" : "justify-center"}`}
    >
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {!metadata && (
          <div className="text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-4xl font-extrabold tracking-tight italic">
              YT-DLP
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Web UI
            </p>
          </div>
        )}

        <VideoURLForm
          showReset={!!metadata}
          isSubmitting={isSubmitting}
          isDownloading={isDownloading}
          error={error}
          onSubmit={handleSubmit}
          onReset={handleReset}
          onDismissError={handleDismissError}
        />

        {!metadata && unfinishedDownloads.length > 0 && (
          <>
            <p className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
              {unfinishedDownloads.length} unfinished downloads
            </p>
            <div className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
              {unfinishedDownloads.map((d) => d.displayData.title)}
            </div>
          </>
        )}

        {metadata && (
          <MetadataDisplay
            data={metadata}
            videoUrl={videoUrl}
            onDownloadStateChange={handleDownloadStateChange}
          />
        )}

        {!metadata && (
          <p className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
            {version ? `v${version} • stable engine` : "yt-dlp not detected"}
          </p>
        )}
      </div>
    </div>
  );
}
