import process from "node:process";

export const APP_CONFIG = {
  STORAGE_PATH: process.env.STORAGE_PATH ?? "storage",
  YTDLP_COMMAND: process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
  RATE_LIMIT_ERROR: "429",
} as const;
