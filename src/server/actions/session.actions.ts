import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { DownloadRequestWithSession } from "@/features/downloader/validators/download-request.validator";
import type { ServerResponse } from "@/shared/types/api.types";
import { deleteDownloadSession, getUnfinishedDownloads } from "../services";
import { logger } from "../utils/logger.utils";

export const getUnfinishedDownloadsAction = createServerFn({
  method: "GET",
}).handler(async (): Promise<ServerResponse<DownloadRequestWithSession[]>> => {
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

export const deleteDownloadAction = createServerFn({
  method: "POST",
})
  .inputValidator((storagePath: string) => z.string().parse(storagePath))
  .handler(async ({ data: storagePath }): Promise<ServerResponse<null>> => {
    logger.info(`Request to delete download session at: ${storagePath}`);

    try {
      await deleteDownloadSession(storagePath);

      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (error) {
      logger.error(`Failed to delete session at ${storagePath}:`, error);

      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while deleting the session",
      };
    }
  });
