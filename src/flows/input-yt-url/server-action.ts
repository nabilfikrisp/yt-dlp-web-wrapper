import { createServerFn } from "@tanstack/react-start";
import { youtubeInputURLSchema } from "./form-schema";
import {
  handleServerError,
  parseYtDlpJson,
  runYtDlp,
  type VideoMetadata,
} from "./server-utils";

type ServerResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export const getVideoMetadata = createServerFn({ method: "POST" })
  .inputValidator(youtubeInputURLSchema)
  .handler(async ({ data }): Promise<ServerResponse<VideoMetadata>> => {
    console.log(`[Terminal] 🚀 Fetching video metadata...`);
    try {
      const result = await runYtDlp([
        "--dump-json",
        "--skip-download",
        "--no-playlist",
        data.url,
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
  });

export const getYTVersion = createServerFn({ method: "POST" }).handler(
  async (): Promise<ServerResponse<string>> => {
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
  },
);
