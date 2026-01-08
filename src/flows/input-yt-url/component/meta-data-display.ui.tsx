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
import { formatBitToMB } from "@/flows/input-yt-url/client-utils";
import type { VideoMetadata } from "@/flows/input-yt-url/server-utils";
import { downloadVideoAction } from "../server-action";
import { SelectionBadge } from "./atomic/selection-badge.ui";
import { SelectionButton } from "./atomic/selection-button.ui";
import { TabTrigger } from "./atomic/tab-trigger.ui";
import { VideoHeader } from "./atomic/video-header.ui";
import { useMetadataManager } from "./use-meta-data-manager.hooks";

export function MetadataDisplay({
  data,
  videoUrl,
}: {
  data: VideoMetadata;
  videoUrl: string;
}) {
  const { state, actions, data: view } = useMetadataManager(data);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <VideoHeader data={data} />

      <Tabs defaultValue="video" className="w-full">
        <TabsList className="w-full h-11 rounded-xl bg-muted/50 p-1">
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

        <div className="mt-2 border rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden">
          {/* Search bar removed from here */}

          <ScrollArea className="h-72">
            <div className="p-2 space-y-1.5">
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

      <div className="space-y-4">
        <div className="flex items-center gap-2 h-14">
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

          <div className="flex flex-col items-center justify-center h-full px-4 rounded-xl border-2 border-primary/20 bg-primary/5 flex-1">
            <span className="text-xs uppercase font-black text-primary leading-none mb-1">
              Total
            </span>
            <span className="text-sm font-mono font-black">
              {view.summary.totalMB}
            </span>
          </div>
        </div>

        {/* INTEGRATED STATUS BANNER (Handles Loading, Success, and Error) */}
        {status !== "idle" && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              status === "loading"
                ? "bg-muted/50 border-border text-muted-foreground"
                : status === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            {/* Dynamic Icon */}
            <div className="mt-0.5">
              {status === "loading" && (
                <Loader className="w-5 h-5 animate-spin text-primary" />
              )}
              {status === "success" && <CheckCircle2 className="w-5 h-5" />}
              {status === "error" && <AlertCircle className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] leading-tight opacity-70">
                {status === "loading" && "Server Task"}
                {status === "success" && "Complete"}
                {status === "error" && "System Halt"}
              </p>
              <p className="text-base font-semibold mt-1">
                {status === "loading" &&
                  "Merging high-quality streams & writing to disk..."}
                {status === "success" && "Video available in /storage folder."}
                {status === "error" &&
                  (errorMessage || "An unknown error occurred.")}
              </p>
            </div>

            {/* Close button - only show if NOT loading */}
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
          className="w-full h-14 rounded-2xl gap-3 shadow-xl font-bold text-base transition-all active:scale-[0.98]"
        >
          {status === "loading" ? (
            "Working..."
          ) : status === "success" ? (
            "Download Again"
          ) : (
            <>
              <Download className="w-5 h-5" />
              {!state.selectedVideo && !state.selectedAudio
                ? "Select Video/Audio"
                : "Extract Media"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
