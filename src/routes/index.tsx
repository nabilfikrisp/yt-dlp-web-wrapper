import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MetadataDisplay } from "@/features/downloader/components/MetadataDisplay";
import { UnfinishedDownloads } from "@/features/downloader/components/UnfinishedDownloads";
import { VideoURLForm } from "@/features/downloader/components/VideoURLForm";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import type { DownloadRequestWithSession } from "@/features/downloader/validators/download-request.validator";
import {
  deleteDownloadAction,
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
  const { version, unfinishedDownloads: initialDownloads } =
    Route.useLoaderData();
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [unfinishedDownloads, setUnfinishedDownloads] =
    useState<DownloadRequestWithSession[]>(initialDownloads);
  const [currentDownload, setCurrentDownload] =
    useState<DownloadRequestWithSession | null>(null);

  const handleReset = () => {
    setMetadata(null);
    setVideoUrl("");
    setError(null);
    setCurrentDownload(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleDownloadStateChange = (downloading: boolean) => {
    setIsDownloading(downloading);
  };

  const handleResume = async (download: DownloadRequestWithSession) => {
    setIsSubmitting(true);
    setError(null);
    setCurrentDownload(download);

    const res = await getVideoMetadataAction({ data: { url: download.url } });

    if (!res.success) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    setMetadata(res.data);
    setVideoUrl(download.url);
    setIsSubmitting(false);
  };

  const handleDelete = async (isolatedSessionFolderTarget: string) => {
    const targetSession = unfinishedDownloads.find(
      (d) => d.isolatedSessionFolder === isolatedSessionFolderTarget,
    );
    const sessionPath = targetSession?.downloadPath;
    const isolatedSessionFolderPath = targetSession?.isolatedSessionFolder;

    if (!sessionPath || !isolatedSessionFolderPath) {
      setError(
        "Missing session path: physical files cannot be located for deletion.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const deletionResult = await deleteDownloadAction({
        data: isolatedSessionFolderPath,
      });

      if (!deletionResult.success) {
        throw new Error(
          deletionResult.error ?? "Server failed to purge download session.",
        );
      }

      const remainingDownloads = unfinishedDownloads.filter(
        (d) => d.isolatedSessionFolder !== isolatedSessionFolderTarget,
      );
      setUnfinishedDownloads(remainingDownloads);

      const isCurrentViewDeleted = videoUrl === isolatedSessionFolderTarget;
      if (isCurrentViewDeleted) {
        handleReset();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown deletion failure.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
          <UnfinishedDownloads
            downloads={unfinishedDownloads}
            onResume={handleResume}
            onDelete={handleDelete}
            isSubmitting={isSubmitting}
            isDownloading={isDownloading}
          />
        )}

        {metadata && (
          <MetadataDisplay
            data={metadata}
            videoUrl={videoUrl}
            initialVideoFormatId={currentDownload?.videoFormatId}
            initialAudioFormatId={currentDownload?.audioFormatId}
            initialSubId={currentDownload?.subId}
            autoStart={!!currentDownload}
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
