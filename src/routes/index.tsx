import { createFileRoute } from "@tanstack/react-router";
import { DownloaderPage } from "@/features/downloader/components/DownloaderPage";
import { getYTVersionAction } from "@/server/actions/downloader.actions";

export const Route = createFileRoute("/")({
  component: DownloaderPage,
  loader: async () => {
    const res = await getYTVersionAction();
    return {
      version: res.success ? res.data : null,
    };
  },
});
