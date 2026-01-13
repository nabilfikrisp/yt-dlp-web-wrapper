import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";

// TODO: GET FILENAME FROM YT-DLP

export async function saveDownloadSession(
  fileName: string,
  data: DownloadRequest,
) {
  const dirPath = path.join(process.cwd(), "storage");
  const filePath = path.join(dirPath, `${fileName}.json`);

  try {
    await mkdir(dirPath, { recursive: true });

    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    return filePath;
  } catch (error) {
    console.error("Failed to save session file:", error);
    throw error;
  }
}
