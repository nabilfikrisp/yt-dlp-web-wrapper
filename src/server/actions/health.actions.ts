import { createServerFn } from "@tanstack/react-start";
import type { ServerResponse } from "@/shared/types/api.types";
import { getYTVersion } from "../services/downloader.service";
import { logger } from "../utils/logger.utils";

export const healthCheckAction = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerResponse<string>> => {
    logger.info("Checking yt-dlp version");
    return await getYTVersion();
  },
);
