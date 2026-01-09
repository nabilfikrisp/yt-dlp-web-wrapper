import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import type { ServerResponse } from "@/shared/types/api.types";
import {
  executeDownload,
  getVideoMetadata,
  getYTVersion,
} from "../services/downloader.service";
import { logger } from "../utils/logger.utils";

const downloadSchema = z.object({
  url: z.string(),
  videoFormatId: z.string().nullable(),
  audioFormatId: z.string().nullable(),
  subId: z.string().nullable(),
});

export const getVideoMetadataAction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ url: z.string() }))
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
  .inputValidator(downloadSchema)
  .handler(async ({ data }): Promise<ServerResponse<string>> => {
    logger.info("Starting download process", { url: data.url });
    return await executeDownload(data);
  });
