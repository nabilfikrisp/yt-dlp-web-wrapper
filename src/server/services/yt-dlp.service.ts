import { spawn } from "node:child_process";

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

export async function* runYtDlpStream(args: string[]): AsyncGenerator<{
  type: "progress";
  data: number;
  raw: string;
  error: null;
}> {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "yt-dlp.exe" : "yt-dlp";

  const finalArgs = ["--newline", ...args];
  const ls = spawn(command, finalArgs);

  const decoder = new TextDecoder();

  let errorOutput = "";
  ls.stderr.on("data", (data) => {
    errorOutput += decoder.decode(data);
  });

  // THIS IS RAW
  // [download] 26.2% of 1.16GiB at 4.66MiB/s ETA 03:08
  for await (const chunk of ls.stdout) {
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

    if (errorOutput.includes("429")) {
      ls.kill();
      throw new Error("429");
    }
  }

  const exitCode = await new Promise((resolve) => ls.on("close", resolve));
  if (exitCode !== 0 && !errorOutput.includes("429")) {
    throw new Error(errorOutput || `yt-dlp failed with code ${exitCode}`);
  }
}
