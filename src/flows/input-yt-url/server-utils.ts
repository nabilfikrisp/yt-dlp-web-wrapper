import { spawn } from "node:child_process";

/**
 * Helper function to run yt-dlp commands
 * Handles OS differences and wraps spawn in a Promise
 */
export async function runYtDlp(args: string[]): Promise<string> {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "yt-dlp.exe" : "yt-dlp";

  return new Promise((resolve, reject) => {
    const ls = spawn(command, args);
    let stdout = "";
    let stderr = "";

    ls.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    ls.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ls.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
      }
    });

    ls.on("error", (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}

export async function* runYtDlpStream(
  args: string[],
): AsyncGenerator<{ type: "progress" | "complete"; data: string }> {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "yt-dlp.exe" : "yt-dlp";

  const ls = spawn(command, args);
  let stderr = "";
  const progressUpdates: string[] = [];
  let isComplete = false;
  let error: Error | null = null;

  const extractProgress = (data: string): string | null => {
    const progressMatch = data.match(/\[download\]\s+(\d+\.?\d*)%/);
    if (progressMatch) {
      console.log(`[Progress] Extracted: ${progressMatch[1]}%`);
      return progressMatch[1];
    }
    return null;
  };

  const onStdoutData = (data: Buffer) => {
    const chunk = data.toString();
    const progress = extractProgress(chunk);
    if (progress) {
      progressUpdates.push(progress);
    }
  };

  const onStderrData = (data: Buffer) => {
    const chunk = data.toString();
    stderr += chunk;
    const progress = extractProgress(chunk);
    if (progress) {
      progressUpdates.push(progress);
    }
  };

  ls.stdout.on("data", onStdoutData);
  ls.stderr.on("data", onStderrData);

  ls.on("close", (code) => {
    ls.stdout.off("data", onStdoutData);
    ls.stderr.off("data", onStderrData);
    isComplete = true;
    if (code !== 0) {
      error = new Error(stderr.trim() || `yt-dlp exited with code ${code}`);
    }
  });

  ls.on("error", (err) => {
    isComplete = true;
    error = new Error(`Failed to start yt-dlp: ${err.message}`);
  });

  let yieldedProgress = new Set<string>();

  while (!isComplete || progressUpdates.length > 0) {
    if (error) {
      throw error;
    }

    while (progressUpdates.length > 0) {
      const progress = progressUpdates.shift();
      if (progress && !yieldedProgress.has(progress)) {
        yieldedProgress.add(progress);
        yield { type: "progress", data: progress };
      }
    }

    if (!isComplete) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (error) {
    throw error;
  }

  yield { type: "complete", data: "Download complete!" };
}

/**
 * Standardizes server-side errors into a consistent response object.
 */
export function handleServerError(error: unknown) {
  // Extract the message safely
  const message = error instanceof Error ? error.message : String(error);

  // Log to server console for debugging
  console.error(`[Terminal] 🚨 Error: ${message}`);

  return {
    success: false,
    data: null,
    error: message || "An unexpected server error occurred",
  };
}

/**
 * Represents a raw format object from yt-dlp JSON output
 */
interface YtDlpFormat {
  format_id: string;
  vcodec: string;
  acodec: string;
  resolution?: string;
  format_note?: string;
  ext: string;
  filesize?: number;
  filesize_approx?: number;
}

/**
 * Represents the raw yt-dlp JSON structure
 */
interface YtDlpRawJson {
  title?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  subtitles?: Record<string, unknown>;
  automatic_captions?: Record<string, unknown>;
  formats?: YtDlpFormat[];
}

/**
 * Updated Parser to distinguish manual vs auto subs
 */
export function parseYtDlpJson(rawJson: string) {
  const json: YtDlpRawJson = JSON.parse(rawJson);

  // Combine manual and automatic subs into a single list with metadata
  const manualSubs = json.subtitles ? Object.keys(json.subtitles) : [];
  const autoSubs = json.automatic_captions
    ? Object.keys(json.automatic_captions)
    : [];

  const allSubtitles = [
    ...manualSubs.map((id) => ({ id, isAuto: false })),
    ...autoSubs.map((id) => ({ id, isAuto: true })),
  ];

  return {
    title: json.title ?? "Unknown Video",
    thumbnail: json.thumbnail ?? "",
    duration: json.duration,
    channel: json.uploader,
    subtitles: allSubtitles, // Array of { id: string, isAuto: boolean }
    videoFormats: (json.formats ?? [])
      .filter((f) => f.vcodec !== "none" && f.acodec === "none")
      .map((f) => ({
        formatId: f.format_id,
        resolution: f.resolution || f.format_note || "Unknown",
        ext: f.ext,
        filesize: f.filesize || f.filesize_approx,
      })),
    audioFormats: (json.formats ?? [])
      .filter((f) => f.acodec !== "none" && f.vcodec === "none")
      .map((f) => ({
        formatId: f.format_id,
        resolution: f.format_note || "audio",
        ext: f.ext,
        filesize: f.filesize || f.filesize_approx,
      })),
  };
}

// Extract the return type for use in the Server Function
export type VideoMetadata = ReturnType<typeof parseYtDlpJson>;
