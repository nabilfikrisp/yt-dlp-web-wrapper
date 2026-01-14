import { useCallback, useState } from "react";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import type { DownloadRequestWithSession } from "@/features/downloader/validators/download-request.validator";
import { deleteDownloadAction, getVideoMetadataAction } from "@/server/actions";

interface UseDownloadStateReturn {
  metadata: VideoMetadata | null;
  videoUrl: string;
  error: string | null;
  isSubmitting: boolean;
  isDownloading: boolean;
  unfinishedDownloads: DownloadRequestWithSession[];
  currentDownload: DownloadRequestWithSession | null;
  handleReset: () => void;
  handleDismissError: () => void;
  handleDownloadStateChange: (downloading: boolean) => void;
  handleResume: (download: DownloadRequestWithSession) => Promise<void>;
  handleDelete: (isolatedSessionFolderTarget: string) => Promise<void>;
  handleSubmit: (url: string) => Promise<void>;
}

export function useDownloadState(
  initialDownloads: DownloadRequestWithSession[],
): UseDownloadStateReturn {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [unfinishedDownloads, setUnfinishedDownloads] =
    useState<DownloadRequestWithSession[]>(initialDownloads);
  const [currentDownload, setCurrentDownload] =
    useState<DownloadRequestWithSession | null>(null);

  const handleReset = useCallback(() => {
    setMetadata(null);
    setVideoUrl("");
    setError(null);
    setCurrentDownload(null);
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const handleDownloadStateChange = useCallback((downloading: boolean) => {
    setIsDownloading(downloading);
  }, []);

  const handleResume = useCallback(
    async (download: DownloadRequestWithSession) => {
      setIsSubmitting(true);
      setError(null);
      setCurrentDownload(download);

      const res = await getVideoMetadataAction({ data: { url: download.url } });

      if (!res.success) {
        setError(res.error ?? "Failed to resume download");
        setIsSubmitting(false);
        return;
      }

      setMetadata(res.data);
      setVideoUrl(download.url);
      setIsSubmitting(false);
    },
    [],
  );

  const handleDelete = useCallback(
    async (isolatedSessionFolderTarget: string) => {
      const targetSession = unfinishedDownloads.find(
        (d) => d.isolatedSessionFolder === isolatedSessionFolderTarget,
      );
      const isolatedSessionFolderPath = targetSession?.isolatedSessionFolder;

      if (!isolatedSessionFolderPath) {
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

        setUnfinishedDownloads((prev) =>
          prev.filter(
            (d) => d.isolatedSessionFolder !== isolatedSessionFolderTarget,
          ),
        );

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
    },
    [unfinishedDownloads, videoUrl, handleReset],
  );

  const handleSubmit = useCallback(async (url: string) => {
    setIsSubmitting(true);
    setError(null);

    const res = await getVideoMetadataAction({ data: { url } });

    if (!res.success) {
      setError(res.error ?? "Failed to fetch video metadata");
      setIsSubmitting(false);
      return;
    }

    setMetadata(res.data);
    setVideoUrl(url);
    setIsSubmitting(false);
  }, []);

  return {
    metadata,
    videoUrl,
    error,
    isSubmitting,
    isDownloading,
    unfinishedDownloads,
    currentDownload,
    handleReset,
    handleDismissError,
    handleDownloadStateChange,
    handleResume,
    handleDelete,
    handleSubmit,
  };
}
