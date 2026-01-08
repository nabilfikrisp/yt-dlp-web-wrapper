import { useMemo, useState } from "react";
import type { VideoMetadata } from "../types/video-metadata.types";
import { formatBitToMB } from "../utils/format.utils";
import { sortByFilesize, sortSubtitles } from "../utils/sort.utils";

export function useMetadataManager(data: VideoMetadata) {
  const sortedVideo = sortByFilesize(data.videoFormats);
  const sortedAudio = sortByFilesize(data.audioFormats);
  const sortedSubs = sortSubtitles(data.subtitles);

  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    sortedVideo[0]?.formatId || null,
  );
  const [selectedAudio, setSelectedAudio] = useState<string | null>(
    sortedAudio[0]?.formatId || null,
  );
  const [selectedSub, setSelectedSub] = useState<string | null>(
    sortedSubs.find((s) => !s.isAuto && s.id.toLowerCase().startsWith("en"))
      ?.id ||
      sortedSubs[0]?.id ||
      null,
  );

  const summary = useMemo(() => {
    const v = data.videoFormats.find((f) => f.formatId === selectedVideo);
    const a = data.audioFormats.find((f) => f.formatId === selectedAudio);
    const totalBits = (v?.filesize || 0) + (a?.filesize || 0);

    return {
      videoLabel: v?.resolution || "None",
      videoSize: v?.filesize ? formatBitToMB(v.filesize) : null,
      audioLabel: a?.ext.toUpperCase() || "None",
      audioSize: a?.filesize ? formatBitToMB(a.filesize) : null,
      subLabel: selectedSub?.toUpperCase() || "None",
      totalMB: totalBits > 0 ? formatBitToMB(totalBits) : "0 MB",
    };
  }, [selectedVideo, selectedAudio, selectedSub, data]);

  return {
    state: { selectedVideo, selectedAudio, selectedSub },
    actions: {
      toggleVideo: (id: string) =>
        setSelectedVideo((prev) => (prev === id ? null : id)),
      toggleAudio: (id: string) =>
        setSelectedAudio((prev) => (prev === id ? null : id)),
      toggleSub: (id: string) =>
        setSelectedSub((prev) => (prev === id ? null : id)),
    },
    data: { sortedVideo, sortedAudio, sortedSubs, summary },
  };
}
