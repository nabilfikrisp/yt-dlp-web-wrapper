import type {
  AudioFormat,
  Subtitle,
  VideoFormat,
  VideoMetadata,
} from "@/features/downloader/types/video-metadata.types";
import type { ServerResponse } from "@/shared/types/api.types";
import { handleServerError } from "../utils/error.utils";
import { runYtDlp } from "./yt-dlp.service";

interface YtDlpFormat {
  format_id: string;
  vcodec: string;
  acodec: string;
  resolution?: string;
  format_note?: string;
  ext: string;
  filesize?: number;
  filesize_approx?: number;
}

interface YtDlpRawJson {
  title?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  subtitles?: Record<string, unknown>;
  automatic_captions?: Record<string, unknown>;
  formats?: YtDlpFormat[];
}

export function parseYtDlpJson(rawJson: string): VideoMetadata {
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

export async function getVideoMetadata(
  url: string,
): Promise<ServerResponse<VideoMetadata>> {
  console.log(`[Terminal] 🚀 Fetching video metadata...`);
  try {
    const result = await runYtDlp([
      "--dump-json",
      "--skip-download",
      "--no-playlist",
      url,
    ]);

    const metadata = parseYtDlpJson(result);

    console.log(`[Terminal] ✅ Success fetching metadata`);

    return {
      success: true,
      data: metadata,
      error: null,
    };
  } catch (error: unknown) {
    return handleServerError(error);
  }
}

export async function getYTVersion(): Promise<ServerResponse<string>> {
  console.log(`[Terminal] 🚀 Checking yt-dlp version...`);

  try {
    const version = await runYtDlp(["--version"]);

    console.log(`[Terminal] ✅ Success: ${version}`);

    return {
      success: true,
      data: version,
      error: null,
    };
  } catch (error: unknown) {
    return handleServerError(error);
  }
}
