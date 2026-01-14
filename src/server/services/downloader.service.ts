import fs from "node:fs/promises";
import path from "node:path";
import type {
  AudioFormat,
  Subtitle,
  VideoFormat,
  VideoMetadata,
} from "@/features/downloader/types/video-metadata.types";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";
import { APP_SERVER_CONFIG } from "@/shared/config/app-server.config";
import type {
  ServerResponse,
  StreamError,
  StreamPreparing,
  StreamProgress,
  StreamSuccess,
} from "@/shared/types/api.types";
import {
  handleDownloadError,
  handleServerError,
  handleStreamError,
} from "../utils/error.utils";
import { logger } from "../utils/logger.utils";
import { runYtDlp, runYtDlpStream } from "./yt-dlp.service";

const FIXED_DOWNLOAD_PATH = path.resolve(
  process.env.DOWNLOAD_PATH || APP_SERVER_CONFIG.STORAGE_PATH,
);

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

interface DownloadPrepared {
  args: string[];
  storagePath: string;
  filename: string;
}

export function createFormatSelection(
  videoFormatId: string | null,
  audioFormatId: string | null,
): string {
  return [videoFormatId, audioFormatId].filter(Boolean).join("+");
}

export async function prepareDownload(
  config: DownloadRequest,
): Promise<DownloadPrepared> {
  const sanitizedTitle = config.displayData.title.replace(/[<>:"/\\|?*]/g, "");
  const filename =
    `${sanitizedTitle}_${config.videoLabel || ""}_${config.audioLabel || ""}`.trim();

  const storagePath = path.join(FIXED_DOWNLOAD_PATH, filename);
  await fs.mkdir(storagePath, { recursive: true });

  const mediaOutputTemplate = path.join(storagePath, `${filename}.%(ext)s`);

  const selectedFormats = createFormatSelection(
    config.videoFormatId,
    config.audioFormatId,
  );

  if (!selectedFormats) {
    throw new Error(
      `Invalid format configuration for: ${config.displayData.title}`,
    );
  }

  const ytDlpExecutionArgs = [
    "-f",
    selectedFormats,
    "-o",
    mediaOutputTemplate,
    "--no-playlist",
    "--part",
    config.url,
  ];

  if (config.subId) {
    ytDlpExecutionArgs.push("--write-subs", "--sub-langs", config.subId);
  }

  return {
    args: ytDlpExecutionArgs,
    storagePath,
    filename,
  };
}

export async function executeDownload(
  config: DownloadRequest,
): Promise<ServerResponse<string>> {
  logger.info("Starting download", { url: config.url });

  try {
    const { storagePath } = await prepareDownload(config);

    await runYtDlp(await prepareDownload(config).then((p) => p.args));

    logger.info("Download complete", { storagePath });
    return {
      success: true,
      data: "Video saved to server storage folder.",
      error: null,
    };
  } catch (error) {
    return handleDownloadError(error);
  }
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
  logger.info("Fetching video metadata", { url });

  try {
    const result = await runYtDlp([
      "--dump-json",
      "--skip-download",
      "--no-playlist",
      url,
    ]);

    const metadata = parseYtDlpJson(result);

    logger.info("Success fetching metadata");

    return {
      success: true,
      data: metadata,
      error: null,
    };
  } catch (error: unknown) {
    return handleServerError(error);
  }
}

export async function* executeDownloadStream(
  config: DownloadRequest,
  signal: AbortSignal,
): AsyncGenerator<
  StreamProgress | StreamSuccess | StreamError | StreamPreparing
> {
  logger.info("Starting download stream", { url: config.url });

  try {
    const { args, storagePath } = await prepareDownload(config);
    yield {
      type: "preparing",
      data: null,
      raw: "",
      error: null,
    };
    yield* runYtDlpStream(args, signal);

    yield {
      type: "success",
      data: `Download saved to: ${storagePath}`,
      raw: "",
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    const streamError = handleStreamError(error, !!config.subId);
    if (streamError) {
      yield streamError;
      return;
    }

    yield { type: "error", data: null, raw: message, error: message };
  }
}

export async function getYTVersion(): Promise<ServerResponse<string>> {
  logger.info("Checking yt-dlp version");

  try {
    const version = await runYtDlp(["--version"]);

    logger.info("Success", { version });

    return {
      success: true,
      data: version,
      error: null,
    };
  } catch (error: unknown) {
    return handleServerError(error);
  }
}
