import { createServerFn } from "@tanstack/react-start";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import { downloadRequestSchema } from "@/features/downloader/validators/download-request.validator";
import {
  executeDownload,
  getVideoMetadata,
  getYTVersion,
} from "@/server/services/downloader";
import type { ServerResponse } from "@/shared/types/api.types";
import { logger } from "../utils/logger";

export const getVideoMetadataAction = createServerFn({ method: "POST" })
  .inputValidator(downloadRequestSchema.pick({ url: true }))
  .handler(async ({ data }): Promise<ServerResponse<VideoMetadata>> => {
    logger.info("Fetching video metadata", { url: data.url });
    return await getVideoMetadata(data.url);
  });

export const getYTVersionAction = createServerFn({ method: "POST" }).handler(
  async (): Promise<ServerResponse<string>> => {
    logger.info("Checking yt-dlp version");
    return await getYTVersion();
  },
);

export const downloadVideoAction = createServerFn({ method: "POST" })
  .inputValidator(downloadRequestSchema)
  .handler(async ({ data }): Promise<ServerResponse<string>> => {
    logger.info("Starting download process", { url: data.url });
    return await executeDownload(data);
  });
