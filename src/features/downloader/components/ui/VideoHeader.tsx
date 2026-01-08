import { Play, User } from "lucide-react";
import type { VideoMetadata } from "../../types/video-metadata.types";
import { formatDuration } from "../../utils/format.utils";

interface VideoHeaderProps {
  data: VideoMetadata;
}

export function VideoHeader({ data }: VideoHeaderProps) {
  return (
    <div className="group relative flex gap-5 p-5 rounded-3xl border bg-gradient-to-br from-card via-card to-muted/20 items-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative w-40 aspect-video rounded-2xl overflow-hidden shrink-0 shadow-xl ring-2 ring-white/10 transition-all duration-300 group-hover:shadow-2xl">
        <img
          src={data.thumbnail}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={data.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-xs px-2 py-0.5 rounded-md text-white font-black tracking-wider border border-white/10">
          {data.duration ? formatDuration(data.duration) : "-"}
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <h2 className="font-extrabold text-lg md:text-xl line-clamp-2 leading-[1.2] tracking-tight text-foreground">
          {data.title}
        </h2>

        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-muted/50 to-muted/30 px-3 py-1 rounded-full border border-border/50 hover:border-primary/30 transition-colors duration-200">
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
