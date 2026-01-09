import { spawn } from "node:child_process";
import { APP_CONFIG } from "@/shared/config/app.config";
import { APP_SERVER_CONFIG } from "@/shared/config/app-server.config";

export async function runYtDlp(args: string[]): Promise<string> {
  const command = APP_SERVER_CONFIG.YTDLP_COMMAND;

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
  signal: AbortSignal,
): AsyncGenerator<
  | {
      type: "progress";
      data: number;
      raw: string;
      error: null;
    }
  | {
      type: "error";
      data: null;
      raw: string;
      error: string;
    }
> {
  const command = APP_SERVER_CONFIG.YTDLP_COMMAND;

  const finalArgs = ["--newline", ...args];
  const ls = spawn(command, finalArgs);

  const closePromise = new Promise<number | null>((resolve) => {
    ls.on("close", (code) => resolve(code));
  });

  const abortHandler = () => {
    ls.kill();
  };

  if (signal.aborted) {
    ls.kill();
    signal.removeEventListener("abort", abortHandler);
    await closePromise;
    const error = new Error("Download cancelled") as Error & { name: string };
    error.name = "AbortError";
    throw error;
  }

  signal.addEventListener("abort", abortHandler);

  const decoder = new TextDecoder();

  let errorOutput = "";
  ls.stderr.on("data", (data) => {
    errorOutput += decoder.decode(data);
  });

  let wasAborted = false;

  try {
    for await (const chunk of ls.stdout) {
      if (signal.aborted) {
        wasAborted = true;
        break;
      }

      const line = decoder.decode(chunk);
      const match = line.match(/(\d+\.\d+)%/);

      if (match) {
        yield {
          type: "progress",
          data: parseFloat(match[1]),
          raw: line.trim(),
          error: null,
        };
      }

      if (errorOutput.includes(APP_CONFIG.RATE_LIMIT_ERROR)) {
        ls.kill();
        throw new Error("429");
      }
    }
  } finally {
    ls.kill();
  }

  const exitCode = await closePromise;
  signal.removeEventListener("abort", abortHandler);

  if (wasAborted) {
    const error = new Error("Download cancelled") as Error & { name: string };
    error.name = "AbortError";
    throw error;
  }

  if (exitCode !== 0 && !errorOutput.includes(APP_CONFIG.RATE_LIMIT_ERROR)) {
    throw new Error(errorOutput || `yt-dlp failed with code ${exitCode}`);
  }
}
