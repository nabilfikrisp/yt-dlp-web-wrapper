import fs from "node:fs/promises";
import path from "node:path";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";
import { logger } from "@/server/utils/logger";
import { APP_SERVER_CONFIG } from "@/shared/config/app-server.config";
import { SESSION_TAG } from "@/shared/config/session.config";
import type {
  ServerResponse,
  StreamError,
  StreamProgress,
  StreamSuccess,
} from "@/shared/types/api.types";
import {
  toDownloadErrorResponse,
  toServerErrorResponse,
  toStreamError,
} from "../errors";
import { saveDownloadSession } from "../session";
import { fetchYtDlpOutput, streamYtDlpProgress } from "../yt-dlp";
import { transformYtDlpJsonToMetadata } from "./metadata.parser";
import type { DownloadPrepared } from "./types";

export function buildYtDlpFormatString(
  videoFormatId: string | null,
  audioFormatId: string | null,
): string {
  return [videoFormatId, audioFormatId].filter(Boolean).join("+");
}

export async function prepareDownload(
  config: DownloadRequest,
): Promise<DownloadPrepared> {
  const downloadBaseDirectory = path.resolve(
    config.downloadPath || APP_SERVER_CONFIG.STORAGE_PATH,
  );

  const sessionIdentity =
    `${config.displayData.title}_${config.videoLabel}_${config.audioLabel}_${SESSION_TAG}`.replace(
      /[<>:"/\\|?*]/g,
      "",
    );

  const isolatedSessionFolder = path.join(
    downloadBaseDirectory,
    sessionIdentity,
  );
  await fs.mkdir(isolatedSessionFolder, { recursive: true });

  const mediaOutputTemplate = path.join(
    isolatedSessionFolder,
    `${sessionIdentity}.%(ext)s`,
  );

  const selectedFormats = buildYtDlpFormatString(
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
    storagePath: isolatedSessionFolder,
    filename: sessionIdentity,
  };
}

export async function executeDownload(
  config: DownloadRequest,
): Promise<ServerResponse<string>> {
  logger.info("Starting download", { url: config.url });

  try {
    const { args, storagePath } = await prepareDownload(config);

    await fetchYtDlpOutput(args);

    logger.info("Download complete", { storagePath });
    return {
      success: true,
      data: "Video saved to server storage folder.",
      error: null,
    };
  } catch (error) {
    return toDownloadErrorResponse(error);
  }
}

export async function getVideoMetadata(
  url: string,
): Promise<ServerResponse<VideoMetadata>> {
  logger.info("Fetching video metadata", { url });

  try {
    const result = await fetchYtDlpOutput([
      "--dump-json",
      "--skip-download",
      "--no-playlist",
      url,
    ]);

    const metadata = transformYtDlpJsonToMetadata(result);

    logger.info("Success fetching metadata");

    return {
      success: true,
      data: metadata,
      error: null,
    };
  } catch (error: unknown) {
    return toServerErrorResponse(error);
  }
}

export async function* executeDownloadStream(
  config: DownloadRequest,
  signal: AbortSignal,
): AsyncGenerator<StreamProgress | StreamSuccess | StreamError> {
  logger.info("Starting download stream", { url: config.url });

  try {
    const { args, filename, storagePath } = await prepareDownload(config);
    await saveDownloadSession(storagePath, filename, config);
    yield* streamYtDlpProgress(args, signal);

    yield {
      type: "success",
      data: "Download finished!",
      raw: "",
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    const streamError = toStreamError(error, !!config.subId);
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
    const version = await fetchYtDlpOutput(["--version"]);

    logger.info("Success", { version });

    return {
      success: true,
      data: version,
      error: null,
    };
  } catch (error: unknown) {
    return toServerErrorResponse(error);
  }
}
