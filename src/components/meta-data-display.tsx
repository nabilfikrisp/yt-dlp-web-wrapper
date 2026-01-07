import { Check, Download, Languages, Monitor, Music, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBitToMB } from "@/flows/input-yt-url/client-utils";
import type { VideoMetadata } from "@/flows/input-yt-url/server-utils";
import { cn } from "@/lib/utils";

export function MetadataDisplay({ data }: { data: VideoMetadata }) {
  const sortedVideoFormats = useMemo(() => {
    return [...data.videoFormats].sort(
      (a, b) => (b.filesize || 0) - (a.filesize || 0),
    );
  }, [data.videoFormats]);

  const sortedAudioFormats = useMemo(() => {
    return [...data.audioFormats].sort(
      (a, b) => (b.filesize || 0) - (a.filesize || 0),
    );
  }, [data.audioFormats]);

  const sortedSubtitles = useMemo(() => {
    return [...data.subtitles].sort((a, b) => {
      // 1. Manual always higher than Auto
      if (a.isAuto !== b.isAuto) return a.isAuto ? 1 : -1;

      // 2. English first within their respective groups
      const aIsEn = a.id.toLowerCase().startsWith("en");
      const bIsEn = b.id.toLowerCase().startsWith("en");
      if (aIsEn && !bIsEn) return -1;
      if (!aIsEn && bIsEn) return 1;

      return a.id.localeCompare(b.id);
    });
  }, [data.subtitles]);

  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    sortedVideoFormats[0]?.formatId || null,
  );
  const [selectedAudio, setSelectedAudio] = useState<string | null>(
    sortedAudioFormats[0]?.formatId || null,
  );
  const [selectedSub, setSelectedSub] = useState<string | null>(
    sortedSubtitles[0]?.id || null,
  );

  const selectionSummary = useMemo(() => {
    const video = data.videoFormats.find((f) => f.formatId === selectedVideo);
    const audio = data.audioFormats.find((f) => f.formatId === selectedAudio);

    const totalBits = (video?.filesize || 0) + (audio?.filesize || 0);
    const totalMB = formatBitToMB(totalBits);

    return {
      video: video?.resolution || "None",
      videoSize: video?.filesize ? formatBitToMB(video.filesize) : null,
      audio: audio?.ext.toUpperCase() || "None",
      audioSize: audio?.filesize ? formatBitToMB(audio.filesize) : null,
      sub: selectedSub?.toUpperCase() || null,
      totalMB,
    };
  }, [selectedVideo, selectedAudio, selectedSub, data]);

  const toggleVideo = (id: string) =>
    setSelectedVideo(selectedVideo === id ? null : id);
  const toggleAudio = (id: string) =>
    setSelectedAudio(selectedAudio === id ? null : id);
  const toggleSub = (id: string) =>
    setSelectedSub(selectedSub === id ? null : id);

  console.log(selectionSummary);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER: Larger Title & Thumb */}
      <div className="flex gap-4 p-4 rounded-2xl border bg-card/50 items-center">
        <div className="relative w-36 aspect-video rounded-xl overflow-hidden shrink-0 shadow-md">
          <img
            src={data.thumbnail}
            className="w-full h-full object-cover"
            alt="thumb"
          />
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] px-2 py-0.5 rounded text-white font-bold">
            {data.duration}s
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-base line-clamp-2 leading-tight tracking-tight">
            {data.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {data.channel}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="video" className="w-full">
        <TabsList className="w-full h-11 rounded-xl bg-muted/50 p-1">
          <TabsTrigger
            value="video"
            className="rounded-lg gap-2 text-xs font-bold uppercase tracking-wide flex-1"
          >
            <Monitor className="w-4 h-4" /> Video {selectedVideo && "•"}
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="rounded-lg gap-2 text-xs font-bold uppercase tracking-wide flex-1"
          >
            <Music className="w-4 h-4" /> Audio {selectedAudio && "•"}
          </TabsTrigger>
          {sortedSubtitles.length > 0 && (
            <TabsTrigger
              value="subs"
              className="rounded-lg gap-2 text-xs font-bold uppercase tracking-wide flex-1"
            >
              <Languages className="w-4 h-4" /> Subs {selectedSub && "•"}
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-2 border rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden">
          <ScrollArea className="h-72">
            <div className="p-2 space-y-1.5">
              <TabsContent
                value="video"
                className="m-0 space-y-1.5 outline-none"
              >
                {sortedVideoFormats.map((f) => (
                  <SelectionButton
                    key={f.formatId}
                    isSelected={selectedVideo === f.formatId}
                    onClick={() => toggleVideo(f.formatId)} // Use toggle
                    title={f.resolution}
                    desc={`${f.ext.toUpperCase()} High Quality`}
                    rightLabel={f.filesize ? formatBitToMB(f.filesize) : null}
                  />
                ))}
              </TabsContent>

              <TabsContent
                value="audio"
                className="m-0 space-y-1.5 outline-none"
              >
                {sortedAudioFormats.map((f) => (
                  <SelectionButton
                    key={f.formatId}
                    isSelected={selectedAudio === f.formatId}
                    onClick={() => toggleAudio(f.formatId)} // Use toggle
                    title={f.resolution.split(",")[0]}
                    desc={`${f.ext.toUpperCase()} Original`}
                    rightLabel={f.filesize ? formatBitToMB(f.filesize) : null}
                  />
                ))}
              </TabsContent>

              <TabsContent
                value="subs"
                className="m-0 space-y-1.5 outline-none"
              >
                {sortedSubtitles.map((sub) => (
                  <SelectionButton
                    key={`${sub.id}-${sub.isAuto}`}
                    isSelected={selectedSub === sub.id}
                    onClick={() => toggleSub(sub.id)}
                    title={sub.id.toUpperCase()}
                    // UX: Visual distinction in description
                    desc={sub.isAuto ? "Auto-Generated" : "Official Subtitles"}
                    // Optional: Add a subtle badge to the right if it's auto
                    rightLabel={sub.isAuto ? "AI" : "HQ"}
                  />
                ))}
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 h-14 w-full">
          <SelectionBadge
            icon={
              <Monitor
                className={cn("w-4 h-4", !selectedVideo && "opacity-20")}
              />
            }
            label={selectionSummary.video}
            sizeLabel={selectionSummary.videoSize}
            isActive={!!selectedVideo}
          />
          <SelectionBadge
            icon={
              <Music
                className={cn("w-4 h-4", !selectedAudio && "opacity-20")}
              />
            }
            label={selectionSummary.audio}
            sizeLabel={selectionSummary.audioSize}
            isActive={!!selectedAudio}
          />
          {sortedSubtitles.length > 0 && (
            <SelectionBadge
              icon={
                <Languages
                  className={cn("w-4 h-4", !selectedSub && "opacity-20")}
                />
              }
              label={
                selectionSummary.sub ? selectionSummary.sub : "No Subtitles"
              }
              isActive={!!selectedSub}
            />
          )}

          <div className="flex flex-col items-center justify-center h-full px-5 rounded-lg border-2 border-primary/20 bg-primary/5 min-w-25 shadow-sm flex-1">
            <span className="text-[10px] uppercase font-black text-primary tracking-tighter leading-none mb-1">
              Total Size
            </span>
            <span className="text-sm font-mono font-black text-foreground leading-none">
              {selectionSummary.totalMB}
            </span>
          </div>
        </div>

        <Button
          disabled={!selectedVideo && !selectedAudio && !selectedSub}
          size="lg"
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] text-base font-bold"
        >
          <Download className="w-5 h-5" />
          {!selectedVideo && !selectedAudio && !selectedSub
            ? "Select an item"
            : "Download Selection"}
        </Button>
      </div>
    </div>
  );
}

function SelectionBadge({
  icon,
  label,
  sizeLabel,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  sizeLabel?: string | null;
  isActive: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all h-full flex-1",
        isActive
          ? "bg-card shadow-sm border-border"
          : "bg-muted/10 border-dashed opacity-40",
      )}
    >
      <div className={isActive ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </div>
      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm font-bold leading-none tracking-tight truncate w-full">
          {label}
        </span>
        {isActive && sizeLabel && (
          <span className="text-xs font-mono font-semibold text-muted-foreground mt-1">
            {sizeLabel}
          </span>
        )}
      </div>
    </div>
  );
}

type SelectionButtonProps = {
  isSelected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  rightLabel?: string | null;
};
/**
 * Selection Button with high-visibility file size and check markers
 */
function SelectionButton({
  isSelected,
  onClick,
  title,
  desc,
  rightLabel,
}: SelectionButtonProps) {
  return (
    <Button
      variant={isSelected ? "default" : "ghost"}
      className={cn(
        "w-full h-auto p-3.5 justify-between rounded-xl border-2 transition-all",
        isSelected
          ? "border-primary shadow-md bg-primary"
          : "border-transparent hover:bg-accent/70 hover:border-accent",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "p-2.5 rounded-lg shrink-0",
            isSelected ? "bg-white/20" : "bg-muted shadow-sm",
          )}
        >
          {rightLabel ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Languages className="w-4 h-4" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="font-bold text-sm md:text-base leading-none tracking-tight">
            {title}
          </span>
          <span
            className={cn(
              "text-[11px] uppercase font-bold tracking-widest opacity-80",
              isSelected ? "text-white/90" : "text-muted-foreground",
            )}
          >
            {desc}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {rightLabel && (
          <span
            className={cn(
              "text-xs font-mono font-extrabold px-3 py-1 rounded-lg transition-colors",
              isSelected
                ? "bg-white text-primary shadow-sm"
                : "bg-muted-foreground/10 text-foreground shadow-xs border border-foreground/5",
            )}
          >
            {rightLabel ? rightLabel : "-"}
          </span>
        )}

        <div className="flex items-center justify-center w-6 h-6">
          {isSelected && (
            <Check className="w-6 h-6 animate-in zoom-in duration-300 stroke-[3px]" />
          )}
        </div>
      </div>
    </Button>
  );
}
