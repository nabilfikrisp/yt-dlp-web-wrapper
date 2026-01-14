import { readdir, readFile, rm, rmdir, unlink } from "node:fs/promises";
import path from "node:path";
import {
  ensureSessionTag,
  getFolderName,
  isProtectedPath,
  isValidSessionFolder,
} from "./guard.service";
import {
  readRegistry,
  removeFolderFromRegistry,
  writeRegistry,
} from "./registry.service";
import type { DownloadRequestWithSession } from "./types";

const DELETABLE_EXTENSIONS = [".part", ".json", ".ytdl"] as const;

async function cleanupOrphanedSession(
  folderPath: string,
  files: string[],
): Promise<void> {
  const absolutePath = path.resolve(folderPath);

  if (!isValidSessionFolder(absolutePath)) return;

  for (const file of files) {
    if (DELETABLE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
      await unlink(path.join(absolutePath, file)).catch(() => {});
    }
  }

  await rm(absolutePath, { recursive: false }).catch(() => {});
}

export async function getUnfinishedDownloads(): Promise<
  DownloadRequestWithSession[]
> {
  const trackedSessionFolders = await readRegistry();

  const activeDownloads: DownloadRequestWithSession[] = [];
  const validFoldersToKeep: string[] = [];

  for (const sessionFolder of trackedSessionFolders) {
    try {
      const absoluteFolder = path.resolve(sessionFolder);

      if (!isValidSessionFolder(absoluteFolder)) continue;

      const folderFiles = await readdir(absoluteFolder);

      const sidecarJsonName = folderFiles.find((name) =>
        name.endsWith(".json"),
      );
      const hasIncompletePartFile = folderFiles.some((name) =>
        name.endsWith(".part"),
      );

      if (sidecarJsonName && hasIncompletePartFile) {
        const sidecarPath = path.join(absoluteFolder, sidecarJsonName);
        const metadataContent = await readFile(sidecarPath, "utf-8");

        activeDownloads.push({
          ...JSON.parse(metadataContent),
          storagePath: absoluteFolder,
        });

        validFoldersToKeep.push(absoluteFolder);
      } else {
        await cleanupOrphanedSession(absoluteFolder, folderFiles);
      }
    } catch (_) {}
  }

  await writeRegistry(validFoldersToKeep);
  return activeDownloads;
}

export async function deleteDownloadSession(
  isolatedSessionFolder: string,
): Promise<{ success: true }> {
  const absoluteTarget = path.resolve(isolatedSessionFolder);
  const folderName = getFolderName(absoluteTarget);

  ensureSessionTag(folderName);

  if (isProtectedPath(absoluteTarget)) {
    throw new Error("Safety Block: Target is a protected system directory.");
  }

  const allInternalItems = await readdir(absoluteTarget).catch(() => []);

  for (const item of allInternalItems) {
    const itemPath = path.join(absoluteTarget, item);
    await rm(itemPath, { recursive: true, force: true }).catch(() => {});
  }

  await rmdir(absoluteTarget, { recursive: false });

  await removeFolderFromRegistry(absoluteTarget);

  return { success: true };
}
