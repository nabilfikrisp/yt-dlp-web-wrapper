import { useMemo, useState } from "react";
import type {
  AudioFormat,
  VideoFormat,
  VideoMetadata,
} from "../types/video-metadata.types";
import { formatBitToMB } from "../utils/format.utils";
import { sortByFilesize, sortSubtitles } from "../utils/sort.utils";

function formatAudioResolutionName(resolution: string) {
  return resolution.split(", ").join("-");
}

function formatAudioLabel(audio?: AudioFormat | null) {
  if (!audio) {
    return "None";
  }

  return `${audio.ext.toUpperCase()}-${formatAudioResolutionName(audio.resolution)}`;
}

function formatVideoLabel(video?: VideoFormat | null) {
  if (!video) {
    return "None";
  }

  return `${video.resolution}-${video.ext.toUpperCase()}`;
}

export function useMetadataManager(data: VideoMetadata) {
  const sortedVideo = sortByFilesize(data.videoFormats);
  const sortedAudio = sortByFilesize(
    data.audioFormats.map((audio) => ({
      ...audio,
      resolution: formatAudioResolutionName(audio.resolution),
    })),
  );
  const sortedSubs = sortSubtitles(data.subtitles);

  const [selectedVideo, setSelectedVideo] = useState<VideoFormat | null>(
    sortedVideo[0] || null,
  );
  const [selectedAudio, setSelectedAudio] = useState<AudioFormat | null>(
    sortedAudio[0] || null,
  );
  const [selectedSub, setSelectedSub] = useState<string | null>(
    sortedSubs.find((s) => !s.isAuto && s.id.toLowerCase().startsWith("en"))
      ?.id ||
      sortedSubs[0]?.id ||
      null,
  );

  const summary = useMemo(() => {
    const v = data.videoFormats.find(
      (f) => f.formatId === selectedVideo?.formatId,
    );
    const a = data.audioFormats.find(
      (f) => f.formatId === selectedAudio?.formatId,
    );
    const totalBits = (v?.filesize || 0) + (a?.filesize || 0);

    return {
      videoLabel: formatVideoLabel(v),
      videoSize: v?.filesize ? formatBitToMB(v.filesize) : null,
      audioLabel: formatAudioLabel(a),
      audioSize: a?.filesize ? formatBitToMB(a.filesize) : null,
      subLabel: selectedSub?.toUpperCase() || "None",
      totalMB: totalBits > 0 ? formatBitToMB(totalBits) : "0 MB",
    };
  }, [selectedVideo, selectedAudio, selectedSub, data]);

  return {
    state: {
      selectedVideo,
      selectedAudio,
      selectedSub,
      selectedVideoLabel: formatVideoLabel(selectedVideo),
      selectedAudioLabel: formatAudioLabel(selectedAudio),
    },
    actions: {
      toggleVideo: (v: VideoFormat) =>
        setSelectedVideo((prev) => (prev === v ? null : v)),
      toggleAudio: (a: AudioFormat) =>
        setSelectedAudio((prev) => (prev === a ? null : a)),
      toggleSub: (id: string) =>
        setSelectedSub((prev) => (prev === id ? null : id)),
    },
    data: { sortedVideo, sortedAudio, sortedSubs, summary },
  };
}
