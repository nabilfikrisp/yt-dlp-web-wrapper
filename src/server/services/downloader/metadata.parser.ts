import type {
  AudioFormat,
  Subtitle,
  VideoFormat,
  VideoMetadata,
} from "@/features/downloader/types/video-metadata.types";
import type { YtDlpRawJson } from "./types";

export function transformYtDlpJsonToMetadata(rawJson: string): VideoMetadata {
  const json: YtDlpRawJson = JSON.parse(rawJson);

  const manualSubs = json.subtitles ? Object.keys(json.subtitles) : [];
  const autoSubs = json.automatic_captions
    ? Object.keys(json.automatic_captions)
    : [];

  const allSubtitles: Subtitle[] = [
    ...manualSubs.map((id) => ({ id, isAuto: false })),
    ...autoSubs.map((id) => ({ id, isAuto: true })),
  ];

  const videoFormats: VideoFormat[] = (json.formats ?? [])
    .filter((f) => f.vcodec !== "none" && f.acodec === "none")
    .map((f) => ({
      formatId: f.format_id,
      resolution: f.resolution || f.format_note || "Unknown",
      ext: f.ext,
      filesize: f.filesize || f.filesize_approx,
    }));

  const audioFormats: AudioFormat[] = (json.formats ?? [])
    .filter((f) => f.acodec !== "none" && f.vcodec === "none")
    .map((f) => ({
      formatId: f.format_id,
      resolution: f.format_note || "audio",
      ext: f.ext,
      filesize: f.filesize || f.filesize_approx,
    }));

  return {
    title: json.title ?? "Unknown Video",
    thumbnail: json.thumbnail ?? "",
    duration: json.duration,
    channel: json.uploader,
    subtitles: allSubtitles,
    videoFormats,
    audioFormats,
  };
}
