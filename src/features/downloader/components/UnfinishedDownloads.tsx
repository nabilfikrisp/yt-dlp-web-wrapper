import { Clock, Monitor, Music, Play, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";

interface UnfinishedDownloadsProps {
  downloads: DownloadRequest[];
  onResume: (download: DownloadRequest) => void;
  onDelete: (url: string) => void;
  isSubmitting: boolean;
  isDownloading: boolean;
}

export function UnfinishedDownloads({
  downloads,
  onResume,
  onDelete,
  isSubmitting,
  isDownloading,
}: UnfinishedDownloadsProps) {
  return (
    <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-4">
      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value="unfinished" className="border-none">
          <AccordionTrigger className="px-4 py-2 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer hover:no-underline">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {downloads.length} Unfinished Download
                {downloads.length !== 1 ? "s" : ""}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <ScrollArea className="max-h-64">
              <div className="space-y-2 pt-4">
                {downloads.map((download) => (
                  <div
                    key={download.url}
                    className="group relative p-3 rounded-3xl border bg-linear-to-br from-card via-card to-muted/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                    <div className="relative flex gap-3 items-center">
                      <div className="relative w-24 aspect-video rounded-2xl overflow-hidden shrink-0 shadow-xl ring-2 ring-white/10">
                        <img
                          src={download.displayData.thumbnail}
                          className="w-full h-full object-cover"
                          alt={download.displayData.title}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm line-clamp-2 leading-[1.2] tracking-tight text-foreground">
                          {download.displayData.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          {download.videoFormatId && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-linear-to-r from-primary/10 to-primary/5 text-[10px] font-bold text-primary border border-primary/20">
                              <Monitor className="w-3 h-3" />
                              {download.videoLabel || "Video"}
                            </span>
                          )}
                          {download.audioFormatId && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-linear-to-r from-secondary/10 to-secondary/5 text-[10px] font-bold text-secondary border border-secondary/20">
                              <Music className="w-3 h-3" />
                              {download.audioLabel || "Audio"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="w-10 h-10 rounded-xl hover:scale-105 transition-transform"
                          onClick={() => onDelete(download.url)}
                          title="Delete"
                          disabled={isSubmitting || isDownloading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="icon"
                          className="w-10 h-10 rounded-xl hover:scale-105 transition-transform"
                          onClick={() => onResume(download)}
                          title="Resume"
                          disabled={isSubmitting || isDownloading}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
