import { createServerFn } from "@tanstack/react-start";
import { getYTVersion } from "@/server/services/downloader";
import type { ServerResponse } from "@/shared/types/api.types";
import { logger } from "../utils/logger";

export const healthCheckAction = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerResponse<string>> => {
    logger.info("Checking yt-dlp version");
    return await getYTVersion();
  },
);
