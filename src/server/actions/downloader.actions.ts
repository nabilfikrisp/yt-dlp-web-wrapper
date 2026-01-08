import fs from "node:fs/promises";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import type { VideoMetadata } from "@/features/downloader/types/video-metadata.types";
import type { ServerResponse } from "@/shared/types/api.types";
import { parseYtDlpJson } from "../services/downloader.service";
import { runYtDlp, runYtDlpStream } from "../services/yt-dlp.service";
import { handleServerError } from "../utils/error.utils";

export const getVideoMetadataAction = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      url: z.string(),
    }),
  )
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

export const getYTVersionAction = createServerFn({ method: "POST" }).handler(
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
  .handler(async ({ data }): Promise<ServerResponse<string>> => {
    console.log(`[Terminal] 📥 Starting download process...`);

    const storagePath = path.resolve("storage");

    try {
      await fs.mkdir(storagePath, { recursive: true });
    } catch (err) {
      console.error("Could not create storage directory", err);
    }

    const outputPath = path.join(storagePath, "%(title)s.%(ext)s");

    const formatSelection = [data.videoFormatId, data.audioFormatId]
      .filter(Boolean)
      .join("+");

    const args = [
      "-f",
      formatSelection || "best",
      "-o",
      outputPath,
      "--no-playlist",
      data.url,
    ];

    if (data.subId) {
      args.push("--write-subs", "--sub-langs", data.subId);
    }

    try {
      await runYtDlp(args);

      console.log(`[Terminal] ✅ Download complete: Saved to ${storagePath}`);
      return {
        success: true,
        data: "Video saved to server storage folder.",
        error: null,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("429") && data.subId) {
        console.log(message);
        return {
          success: false,
          data: null,
          error: "Cannot download subtitles at the moment",
        };
      }

      return handleServerError(error);
    }
  });

type StreamProgress = {
  type: "progress";
  data: number;
  raw: string;
  error: null;
};

type StreamSuccess = {
  type: "success";
  data: string;
  raw: string;
  error: null;
};

type StreamError = {
  type: "error";
  data: null;
  raw: string;
  error: string;
};
export const streamDownloadVideoAction = createServerFn({ method: "POST" })
  .inputValidator(downloadSchema)
  .handler(async function* ({
    data,
  }): AsyncGenerator<StreamProgress | StreamSuccess | StreamError> {
    console.log(`[Terminal] 📥 Starting download process...`);

    const storagePath = path.resolve("storage");

    try {
      await fs.mkdir(storagePath, { recursive: true });
    } catch (err) {
      console.error("Could not create storage directory", err);
    }

    const outputPath = path.join(storagePath, "%(title)s.%(ext)s");

    const formatSelection = [data.videoFormatId, data.audioFormatId]
      .filter(Boolean)
      .join("+");

    const args = [
      "-f",
      formatSelection || "best",
      "-o",
      outputPath,
      "--no-playlist",
      data.url,
    ];

    if (data.subId) {
      args.push("--write-subs", "--sub-langs", data.subId);
    }

    try {
      for await (const update of runYtDlpStream(args)) {
        yield update;
      }

      yield {
        type: "success",
        data: "Download finished!",
        raw: "",
        error: null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("429") && data.subId) {
        console.log(message);
        yield {
          type: "error",
          data: null,
          raw: message,
          error: "Rate limit hit. Try again in an hour.",
        };
      }

      yield { type: "error", data: null, raw: message, error: message };
    }
  });
