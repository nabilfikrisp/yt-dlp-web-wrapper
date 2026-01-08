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
