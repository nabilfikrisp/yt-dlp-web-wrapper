import { createFileRoute } from "@tanstack/react-router";
import { MetadataDisplay } from "@/features/downloader/components/MetadataDisplay";
import { UnfinishedDownloads } from "@/features/downloader/components/UnfinishedDownloads";
import { VideoURLForm } from "@/features/downloader/components/VideoURLForm";
import { useDownloadState } from "@/hooks/useDownloadState";
import {
  getUnfinishedDownloadsAction,
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
  const {
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
  } = useDownloadState(initialDownloads);

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
            initialDownloadPath={currentDownload?.downloadPath}
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
