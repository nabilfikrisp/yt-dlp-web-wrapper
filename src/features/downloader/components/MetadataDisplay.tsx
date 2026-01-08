import {
  AlertCircle,
  CheckCircle2,
  Download,
  Languages,
  Loader,
  Monitor,
  Music,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import {
  downloadVideoAction,
  streamDownloadVideoAction,
} from "@/server/actions/downloader.actions";
import { useMetadataManager } from "../hooks/useMetadataManager";
import type { VideoMetadata } from "../types/video-metadata.types";
import type {
  StreamProgress,
  StreamSuccess,
  StreamError,
  StreamIdle,
} from "@/shared/types/api.types";
import { formatBitToMB } from "../utils/format.utils";
import { SelectionBadge } from "./ui/SelectionBadge";
import { SelectionButton } from "./ui/SelectionButton";
import { TabTrigger } from "./ui/TabTrigger";
import { VideoHeader } from "./ui/VideoHeader";

interface MetadataDisplayProps {
  data: VideoMetadata;
  videoUrl: string;
}

export function MetadataDisplay({ data, videoUrl }: MetadataDisplayProps) {
  const { state, actions, data: view } = useMetadataManager(data);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [streamResult, setStreamResult] = useState<
    StreamIdle | StreamProgress | StreamError | StreamSuccess
  >({
    type: "idle",
    data: null,
    raw: "",
    error: null,
  });

  const [controller, setController] = useState<AbortController | null>(null);

  async function handleDownloadClick() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await downloadVideoAction({
        data: {
          url: videoUrl,
          videoFormatId: state.selectedVideo,
          audioFormatId: state.selectedAudio,
          subId: state.selectedSub,
        },
      });

      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(res.error);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    }
  }

  async function streamDownload() {
    if (controller) {
      controller.abort();
    }

    const ctrl = new AbortController();
    setController(ctrl);

    try {
      for await (const update of await streamDownloadVideoAction({
        data: {
          url: videoUrl,
          videoFormatId: state.selectedVideo,
          audioFormatId: state.selectedAudio,
          subId: state.selectedSub,
        },
        signal: ctrl.signal,
      })) {
        setStreamResult(update);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setStreamResult({
          type: "idle",
          data: null,
          raw: "Download cancelled",
          error: null,
        });
      } else {
        setStatus("error");
        setStreamResult({
          type: "error",
          data: null,
          raw: "",
          error: error instanceof Error ? error.message : "",
        });
      }
    } finally {
      setController(null);
    }
  }

  function cancelDownload() {
    controller?.abort();
    resetStreamResult();
  }

  function resetStreamResult() {
    setStreamResult({
      type: "idle",
      data: null,
      raw: "",
      error: null,
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <VideoHeader data={data} />

      <Tabs defaultValue="video" className="w-full">
        <TabsList className="w-full h-12 rounded-xl bg-muted/40 p-1 backdrop-blur-sm border border-border/50 shadow-sm">
          <TabTrigger
            value="video"
            icon={<Monitor className="w-4 h-4" />}
            label="Video"
            active={!!state.selectedVideo}
          />
          <TabTrigger
            value="audio"
            icon={<Music className="w-4 h-4" />}
            label="Audio"
            active={!!state.selectedAudio}
          />
          {view.sortedSubs.length > 0 && (
            <TabTrigger
              value="subs"
              icon={<Languages className="w-4 h-4" />}
              label="Subs"
              active={!!state.selectedSub}
            />
          )}
        </TabsList>

        <div className="mt-3 border rounded-xl bg-linear-to-b from-card/40 to-card/20 backdrop-blur-sm overflow-hidden shadow-sm">
          <ScrollArea className="h-80">
            <div className="p-3 space-y-2">
              <TabsContent
                value="video"
                className="m-0 space-y-1.5 outline-none"
              >
                {view.sortedVideo.map((f) => (
                  <SelectionButton
                    key={f.formatId}
                    isSelected={state.selectedVideo === f.formatId}
                    onClick={() => actions.toggleVideo(f.formatId)}
                    title={f.resolution}
                    desc={`${f.ext.toUpperCase()} Quality`}
                    rightLabel={f.filesize ? formatBitToMB(f.filesize) : null}
                  />
                ))}
              </TabsContent>

              <TabsContent
                value="audio"
                className="m-0 space-y-1.5 outline-none"
              >
                {view.sortedAudio.map((f) => (
                  <SelectionButton
                    key={f.formatId}
                    isSelected={state.selectedAudio === f.formatId}
                    onClick={() => actions.toggleAudio(f.formatId)}
                    title={f.resolution ? f.resolution.split(",")[0] : "Audio"}
                    desc={`${f.ext.toUpperCase()} Audio`}
                    rightLabel={f.filesize ? formatBitToMB(f.filesize) : null}
                  />
                ))}
              </TabsContent>

              <TabsContent
                value="subs"
                className="m-0 space-y-1.5 outline-none"
              >
                {view.sortedSubs.map((sub) => (
                  <SelectionButton
                    key={sub.id}
                    isSelected={state.selectedSub === sub.id}
                    onClick={() => actions.toggleSub(sub.id)}
                    title={sub.id.toUpperCase()}
                    desc={sub.isAuto ? "Auto-Generated" : "Official Subtitle"}
                    rightLabel={sub.isAuto ? "AI" : "HQ"}
                  />
                ))}
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>

      <div className="space-y-6">
        <div className="flex items-center gap-3 h-16 p-1 rounded-xl bg-linear-to-r from-muted/30 to-muted/10 backdrop-blur-sm border border-border/30">
          <SelectionBadge
            icon={<Monitor className="w-4 h-4" />}
            label={view.summary.videoLabel}
            size={view.summary.videoSize}
            active={!!state.selectedVideo}
          />
          <SelectionBadge
            icon={<Music className="w-4 h-4" />}
            label={view.summary.audioLabel}
            size={view.summary.audioSize}
            active={!!state.selectedAudio}
          />
          <SelectionBadge
            icon={<Languages className="w-4 h-4" />}
            label={view.summary.subLabel}
            active={!!state.selectedSub}
          />

          <div className="flex flex-col items-center justify-center h-full px-4 rounded-xl border-2 border-primary/20 bg-linear-to-r from-primary/5 to-primary/10 flex-1 shadow-sm">
            <span className="text-xs uppercase font-black text-primary leading-none mb-1">
              Total
            </span>
            <span className="text-sm font-mono font-black text-foreground">
              {view.summary.totalMB}
            </span>
          </div>
        </div>

        {status !== "idle" && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              status === "loading"
                ? "bg-muted/30 border-border/50 text-muted-foreground"
                : status === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            <div className="mt-0.5">
              {status === "loading" && (
                <Loader className="w-5 h-5 animate-spin text-primary" />
              )}
              {status === "success" && <CheckCircle2 className="w-5 h-5" />}
              {status === "error" && <AlertCircle className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <p
                className={`text-xs font-black uppercase tracking-wider leading-tight ${
                  status === "loading"
                    ? "opacity-70"
                    : status === "success"
                      ? "text-green-600 dark:text-green-400/80"
                      : "text-destructive/80"
                }`}
              >
                {status === "loading" && "Processing"}
                {status === "success" && "Complete"}
                {status === "error" && "Error"}
              </p>
              <p className="text-sm font-semibold mt-1">
                {status === "loading" && "Merging streams & saving to disk..."}
                {status === "success" && "Video saved to /storage folder"}
                {status === "error" &&
                  (errorMessage || "An unknown error occurred.")}
              </p>
            </div>

            {status !== "loading" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStatus("idle")}
                className="h-8 w-8 -mr-2 -mt-1"
              >
                <XIcon className="w-4 h-4 opacity-50 hover:opacity-100" />
              </Button>
            )}
          </div>
        )}

        <Button
          onClick={handleDownloadClick}
          disabled={
            status === "loading" ||
            (!state.selectedVideo && !state.selectedAudio)
          }
          size="lg"
          variant={status === "error" ? "destructive" : "default"}
          className="w-full h-14 rounded-2xl gap-3 shadow-xl shadow-primary/25 font-semibold text-base transition-all duration-200 active:scale-[0.98] hover:shadow-2xl hover:shadow-primary/30 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {status === "loading" ? (
            <div className="flex items-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </div>
          ) : status === "success" ? (
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Again
            </div>
          ) : (
            <>
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
              {!state.selectedVideo && !state.selectedAudio
                ? "Select Video/Audio"
                : "Extract Media"}
            </>
          )}
        </Button>

        {streamResult.type === "idle" ? (
          <Button onClick={streamDownload}>Stream Download</Button>
        ) : (
          <div>
            simple stream banner
            <div>Stream Type: {streamResult.type}</div>
            <div>Stream Data: {streamResult.data}</div>
            <div>Stream Raw: {streamResult.raw}</div>
            <div>Stream Error: {streamResult.error}</div>
            {streamResult.type === "progress" && (
              <Button onClick={cancelDownload}>Cancel Download</Button>
            )}
            {streamResult.type === "success" && (
              <Button onClick={resetStreamResult}>Close</Button>
            )}
            {streamResult.type === "error" && (
              <Button onClick={resetStreamResult}>Close</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
