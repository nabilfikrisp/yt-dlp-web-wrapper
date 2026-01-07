import fs from "node:fs/promises";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { youtubeInputURLSchema } from "./form-schema";
import {
  handleServerError,
  parseYtDlpJson,
  runYtDlp,
  type VideoMetadata
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

const downloadSchema = z.object({
  url: z.string(),
  videoFormatId: z.string().nullable(),
  audioFormatId: z.string().nullable(),
  subId: z.string().nullable(),
});

export const downloadVideoAction = createServerFn({ method: "POST" })
  .inputValidator(downloadSchema)
  .handler(async ({ data }) => {
    console.log(`[Terminal] 📥 Starting download process...`);

    // 1. Define and Ensure Storage Path
    // path.resolve ensures we are looking at the root /storage of your project
    const storagePath = path.resolve("storage");

    try {
      await fs.mkdir(storagePath, { recursive: true });
    } catch (err) {
      console.error("Could not create storage directory", err);
    }

    // 2. Construct the output template
    // %(title)s.%(ext)s is yt-dlp syntax for the filename
    const outputPath = path.join(storagePath, "%(title)s.%(ext)s");

    // 3. Prepare Arguments
    const formatSelection = [data.videoFormatId, data.audioFormatId]
      .filter(Boolean)
      .join("+");

    const args = [
      "-f",
      formatSelection || "best",
      "-o",
      outputPath, // Tell yt-dlp to save in our storage folder
      "--no-playlist",
      data.url,
    ];

    if (data.subId) {
      args.push("--write-subs", "--sub-langs", data.subId);
    }

    try {
      // runYtDlp will now execute with the -o flag pointing to ./storage
      await runYtDlp(args);

      console.log(`[Terminal] ✅ Download complete: Saved to ${storagePath}`);
      return {
        success: true,
        message: "Video saved to server storage folder.",
      };
    } catch (error) {
      console.error("[Terminal] ❌ Download failed", error);
      throw new Error("Failed to process download");
    }
  });
