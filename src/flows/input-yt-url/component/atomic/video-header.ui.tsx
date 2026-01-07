import { User } from "lucide-react";
import { formatDuration } from "../../client-utils";
import type { VideoMetadata } from "../../server-utils";

/**
 * A component to display the video metadata.
 * It takes in a VideoMetadata object as a prop and displays the thumbnail, title, duration, and channel.
 * The component is a flex container with two children: a relative container with a thumbnail and a duration label, and a min-width container with the title and channel.
 * The thumbnail is an img tag with an absolute position and a duration label at the bottom right corner.
 * The title and channel are displayed in a font-bold text-sm line-clamp-2 h2 and a flex items-center gap-2 mt-1 text-[11px] text-muted-foreground div respectively.
 */
export function VideoHeader({ data }: { data: VideoMetadata }) {
  return (
    <div className="group relative flex gap-5 p-4 rounded-3xl border bg-linear-to-br from-card to-muted/30 items-center transition-all hover:border-primary/20">
      {/* Thumbnail Container */}
      <div className="relative w-36 aspect-video rounded-2xl overflow-hidden shrink-0 shadow-lg ring-1 ring-white/10">
        <img
          src={data.thumbnail}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={data.title}
        />
        {/* Duration Badge: Slightly larger and more readable */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-md text-white font-black tracking-wider">
          {data.duration ? formatDuration(data.duration) : "-"}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <h2 className="font-extrabold text-base md:text-lg line-clamp-2 leading-[1.2] tracking-tight text-foreground/90">
          {data.title}
        </h2>

        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
            <User className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-bold truncate max-w-30">
              {data.channel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
