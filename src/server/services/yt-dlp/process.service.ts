import { spawn } from "node:child_process";
import { APP_SERVER_CONFIG } from "@/shared/config/app-server.config";
import { isRateLimitMessage, parseProgressLine } from "./progress.parser";

export type StreamProgressEvent = {
  type: "progress";
  data: number;
  raw: string;
  error: null;
};

export type StreamErrorEvent = {
  type: "error";
  data: null;
  raw: string;
  error: string;
};

export type StreamEvent = StreamProgressEvent | StreamErrorEvent;

const YT_DLP_COMMAND = APP_SERVER_CONFIG.YTDLP_COMMAND;

export async function fetchYtDlpOutput(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(YT_DLP_COMMAND, args);
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
      }
    });

    process.on("error", (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}

export async function* streamYtDlpProgress(
  args: string[],
  signal: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const finalArgs = ["--newline", ...args];
  const process = spawn(YT_DLP_COMMAND, finalArgs);

  const closePromise = new Promise<number | null>((resolve) => {
    process.on("close", (code) => resolve(code));
  });

  const abortHandler = () => {
    process.kill();
  };

  if (signal.aborted) {
    process.kill();
    signal.removeEventListener("abort", abortHandler);
    await closePromise;
    const error = new Error("Download cancelled") as Error & { name: string };
    error.name = "AbortError";
    throw error;
  }

  signal.addEventListener("abort", abortHandler);

  const decoder = new TextDecoder();
  let stderrOutput = "";
  let wasAborted = false;

  process.stderr.on("data", (data) => {
    stderrOutput += decoder.decode(data);
  });

  try {
    for await (const chunk of process.stdout) {
      if (signal.aborted) {
        wasAborted = true;
        break;
      }

      const line = decoder.decode(chunk);
      const progress = parseProgressLine(line);

      if (progress) {
        yield {
          type: "progress",
          data: progress.percentage,
          raw: progress.raw,
          error: null,
        };
      }

      if (isRateLimitMessage(stderrOutput)) {
        process.kill();
        throw new Error("429");
      }
    }
  } finally {
    process.kill();
  }

  const exitCode = await closePromise;
  signal.removeEventListener("abort", abortHandler);

  if (wasAborted) {
    const error = new Error("Download cancelled") as Error & { name: string };
    error.name = "AbortError";
    throw error;
  }

  const hasRateLimit = isRateLimitMessage(stderrOutput);
  const hasNonZeroExit = exitCode !== 0;

  if (hasNonZeroExit && !hasRateLimit) {
    throw new Error(stderrOutput || `yt-dlp failed with code ${exitCode}`);
  }
}
