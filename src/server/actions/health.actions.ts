import { createServerFn } from "@tanstack/react-start";
import type { ServerResponse } from "@/shared/types/api.types";
import { getYTVersion } from "../services/downloader.service";

export const healthCheckAction = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerResponse<string>> => {
    console.log(`[Terminal] 🚀 Checking yt-dlp version...`);

    try {
      const version = await getYTVersion();

      console.log(`[Terminal] ✅ Success: ${version.data}`);

      return version;
    } catch (error: unknown) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Health check failed",
      };
    }
  },
);
