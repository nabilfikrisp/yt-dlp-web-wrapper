import { Play, User } from "lucide-react";
import type { VideoMetadata } from "../../types/video-metadata.types";
import { formatDuration } from "../../utils/format.utils";

interface VideoHeaderProps {
  data: VideoMetadata;
}

export function VideoHeader({ data }: VideoHeaderProps) {
  return (
    <div className="group relative flex gap-5 p-4 rounded-3xl border bg-linear-to-br from-card to-muted/30 items-center transition-all hover:border-primary/20">
      <div className="relative w-36 aspect-video rounded-2xl overflow-hidden shrink-0 shadow-lg ring-1 ring-white/10">
        <img
          src={data.thumbnail}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={data.title}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg">
              <Play className="w-5 h-5 text-foreground fill-foreground" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-xs px-2 py-0.5 rounded-md text-white font-black tracking-wider">
          {data.duration ? formatDuration(data.duration) : "-"}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <h2 className="font-extrabold text-base md:text-lg line-clamp-2 leading-[1.2] tracking-tight text-foreground/90">
          {data.title}
        </h2>

        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
            <User className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold truncate max-w-30">
              {data.channel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
