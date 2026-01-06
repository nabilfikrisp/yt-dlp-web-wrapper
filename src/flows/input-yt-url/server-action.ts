import { spawn } from "node:child_process";
import { createServerFn } from "@tanstack/react-start";
import { youtubeInputURLSchema } from "./form-schema";

export const processURL = createServerFn({ method: "POST" })
  .inputValidator(youtubeInputURLSchema)
  .handler(async ({ data }) => {
    console.log("Server: Starting terminal test...");

    return new Promise<{ success: boolean; terminalOutput: string }>(
      (resolve, reject) => {
        const process = spawn("cmd.exe", ["/c", "dir"]);

        let output = "";

        process.stdout.on("data", (data) => {
          output += data.toString();
        });

        process.on("close", (code) => {
          if (code === 0) {
            console.log("Server: Terminal test success!");
            resolve({ success: true, terminalOutput: output });
          } else {
            reject(new Error("Terminal command failed"));
          }
        });

        process.on("error", (err) => {
          reject(new Error(`Failed to start process: ${err.message}`));
        });
      },
    );
  });

export const getYTVersion = createServerFn({ method: "POST" }).handler(
  async () => {
    return new Promise<{ success: boolean; version: string }>(
      (resolve, reject) => {
        // Add { shell: true } as the third argument
        const process = spawn("yt-dlp", ["--version"], { shell: true });

        let output = "";
        let errorOutput = "";

        process.stdout.on("data", (data) => {
          output += data.toString();
        });
        process.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        process.on("close", (code) => {
          if (code === 0) {
            resolve({ success: true, version: output.trim() });
          } else {
            reject(new Error(`Exit code ${code}: ${errorOutput}`));
          }
        });

        process.on("error", (err) => {
          // This triggers if "yt-dlp" literally can't be found
          reject(new Error(`Process Error: ${err.message}`));
        });
      },
    );
  },
);
