import { useMemo, useState } from "react";
import type { VideoMetadata } from "../types/video-metadata.types";
import { formatBitToMB } from "../utils/format.utils";

export function useMetadataManager(data: VideoMetadata) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    [...data.videoFormats].sort(
      (a, b) => (b.filesize || 0) - (a.filesize || 0),
    )[0]?.formatId || null,
  );
  const [selectedAudio, setSelectedAudio] = useState<string | null>(
    [...data.audioFormats].sort(
      (a, b) => (b.filesize || 0) - (a.filesize || 0),
    )[0]?.formatId || null,
  );
  const [selectedSub, setSelectedSub] = useState<string | null>(
    data.subtitles.find((s) => !s.isAuto && s.id.toLowerCase().startsWith("en"))
      ?.id ||
      data.subtitles[0]?.id ||
      null,
  );

  const sortedVideo = useMemo(
    () =>
      [...data.videoFormats].sort(
        (a, b) => (b.filesize || 0) - (a.filesize || 0),
      ),
    [data.videoFormats],
  );

  const sortedAudio = useMemo(
    () =>
      [...data.audioFormats].sort(
        (a, b) => (b.filesize || 0) - (a.filesize || 0),
      ),
    [data.audioFormats],
  );

  const sortedSubs = useMemo(() => {
    return [...data.subtitles].sort((a, b) => {
      if (a.isAuto !== b.isAuto) return a.isAuto ? 1 : -1;
      const aIsEn = a.id.toLowerCase().startsWith("en");
      const bIsEn = b.id.toLowerCase().startsWith("en");
      if (aIsEn && !bIsEn) return -1;
      if (!aIsEn && bIsEn) return 1;
      return a.id.localeCompare(b.id);
    });
  }, [data.subtitles]);

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
