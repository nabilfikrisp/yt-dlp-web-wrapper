import { createServerFn } from "@tanstack/react-start";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";
import type { ServerResponse } from "@/shared/types/api.types";
import { getUnfinishedDownloads } from "../services";
import { logger } from "../utils/logger.utils";

export const getUnfinishedDownloadsAction = createServerFn({
  method: "GET",
}).handler(async (): Promise<ServerResponse<DownloadRequest[]>> => {
  logger.info("Initiating scan for unfinished download sessions");

  try {
    const unfinishedDownloads = await getUnfinishedDownloads();

    return {
      success: true,
      data: unfinishedDownloads,
      error: null,
    };
  } catch (error) {
    logger.error("Failed to retrieve unfinished downloads:", error);

    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred while fetching sessions",
    };
  }
});
