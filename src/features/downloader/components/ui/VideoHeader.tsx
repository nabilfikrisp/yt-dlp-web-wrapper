import { User } from "lucide-react";
import type { VideoMetadata } from "../../types/video-metadata.types";
import { formatDuration } from "../../utils/format.utils";

interface VideoHeaderProps {
  data: VideoMetadata;
}

export function VideoHeader({ data }: VideoHeaderProps) {
  return (
    <div className="flex gap-5 p-5 rounded-3xl border bg-linear-to-br from-card via-card to-muted/20 items-center">
      <div className="relative w-40 aspect-video rounded-2xl overflow-hidden shrink-0 shadow-xl ring-2 ring-white/10">
        <img
          src={data.thumbnail}
          className="w-full h-full object-cover"
          alt={data.title}
        />
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-xs px-2 py-0.5 rounded-md text-white font-black tracking-wider border border-white/10">
          {data.duration ? formatDuration(data.duration) : "-"}
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <h2 className="font-extrabold text-lg md:text-xl line-clamp-2 leading-[1.2] tracking-tight text-foreground">
          {data.title}
        </h2>

        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-linear-to-r from-muted/50 to-muted/30 px-3 py-1 rounded-full border border-border/50">
            <User className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold truncate max-w-32">
              {data.channel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
