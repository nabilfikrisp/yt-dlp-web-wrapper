import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";

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

export async function getUnfinishedDownloads() {
  const storageDir = path.join(process.cwd(), "storage");

  await syncDiskSessions(storageDir);

  const allFiles = await readdir(storageDir).catch(() => []);
  const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
  const partFiles = allFiles.filter((f) => f.endsWith(".part"));

  const unfinished = [];

  for (const jsonFile of jsonFiles) {
    const baseName = path.parse(jsonFile).name;
    const matchingPart = partFiles.find((p) => p.startsWith(baseName));

    if (matchingPart) {
      try {
        const content = await readFile(
          path.join(storageDir, jsonFile),
          "utf-8",
        );
        const data = JSON.parse(content);
        unfinished.push({ fileName: baseName, ...data });
      } catch (_) {
        // If JSON is corrupt, we do nothing.
        // reconcileDiskSessions will handle it on the next run if necessary.
      }
    }
  }

  return unfinished;
}

export async function syncDiskSessions(storageDir: string) {
  const allFiles = await readdir(storageDir).catch(() => []);

  const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
  const partFiles = allFiles.filter((f) => f.endsWith(".part"));

  // 1. Clean orphaned JSONs (No matching .part)
  for (const jsonFile of jsonFiles) {
    const baseName = path.parse(jsonFile).name;
    const hasMatch = partFiles.some((p) => p.startsWith(baseName));

    if (!hasMatch) {
      await unlink(path.join(storageDir, jsonFile)).catch(() => {});
    }
  }

  // 2. Clean orphaned .parts (No matching JSON)
  for (const partFile of partFiles) {
    const hasMatch = jsonFiles.some((j) =>
      partFile.startsWith(path.parse(j).name),
    );

    if (!hasMatch) {
      await unlink(path.join(storageDir, partFile)).catch(() => {});
    }
  }
}
