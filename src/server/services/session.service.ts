import {
  mkdir,
  readdir,
  readFile,
  rm,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type {
  DownloadRequest,
  DownloadRequestWithSession,
} from "@/features/downloader/validators/download-request.validator";
import { SESSION_TAG } from "@/shared/config/session.config";

const GLOBAL_REGISTRY_FILE_PATH = path.resolve(
  process.cwd(),
  "storage",
  "registry",
  "registry.json",
);

/**
 * Persists the download metadata locally.
 * Note: The UI/Caller must ensure isolatedSessionFolder ends with SESSION_TAG
 */
export async function saveDownloadSession(
  isolatedSessionFolder: string,
  sessionIdentity: string,
  downloadMetadata: DownloadRequest,
) {
  // GUARD: Ensure we are only saving into a tagged session folder
  if (!isolatedSessionFolder.endsWith(SESSION_TAG)) {
    throw new Error(
      "Security Violation: Target folder must carry the session tag.",
    );
  }

  const sidecarMetadataPath = path.join(
    isolatedSessionFolder,
    `${sessionIdentity}.json`,
  );

  try {
    await mkdir(isolatedSessionFolder, { recursive: true });

    const metadataValue: DownloadRequestWithSession = {
      ...downloadMetadata,
      isolatedSessionFolder,
      sessionIdentity,
    };
    const serializedMetadata = JSON.stringify(metadataValue, null, 2);
    await writeFile(sidecarMetadataPath, serializedMetadata, "utf-8");

    await bookmarkSessionFolderInRegistry(isolatedSessionFolder);

    return sidecarMetadataPath;
  } catch (error) {
    console.error(
      `Critical failure persisting session: ${sessionIdentity}`,
      error,
    );
    throw error;
  }
}

async function bookmarkSessionFolderInRegistry(folderPath: string) {
  const absolutePath = path.resolve(folderPath);
  const registryDirectory = path.dirname(GLOBAL_REGISTRY_FILE_PATH);
  await mkdir(registryDirectory, { recursive: true });

  const existingRegistryContent = await readFile(
    GLOBAL_REGISTRY_FILE_PATH,
    "utf-8",
  ).catch(() => "[]");
  const trackedSessionFolders: string[] = JSON.parse(existingRegistryContent);

  const isAlreadyTracked = trackedSessionFolders.some(
    (p) => path.resolve(p) === absolutePath,
  );

  if (!isAlreadyTracked) {
    trackedSessionFolders.push(absolutePath);
    await updateRegistryFile(trackedSessionFolders);
  }
}

export async function getUnfinishedDownloads(): Promise<
  DownloadRequestWithSession[]
> {
  const registryContent = await readFile(
    GLOBAL_REGISTRY_FILE_PATH,
    "utf-8",
  ).catch(() => "[]");
  const trackedSessionFolders: string[] = JSON.parse(registryContent);

  const activeDownloads: DownloadRequestWithSession[] = [];
  const validFoldersToKeep: string[] = [];

  for (const sessionFolder of trackedSessionFolders) {
    try {
      const absoluteFolder = path.resolve(sessionFolder);

      // GUARD: Skip any folder in registry that doesn't have our tag
      if (!absoluteFolder.endsWith(SESSION_TAG)) continue;

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
        // Only cleanup if it's a tagged folder
        await cleanupOrphanedSession(absoluteFolder, folderFiles);
      }
    } catch (_) {
      // Folder missing/inaccessible
    }
  }

  await updateRegistryFile(validFoldersToKeep);
  return activeDownloads;
}

/**
 * Safe cleanup: Only unlinks if the folder name is verified.
 */
async function cleanupOrphanedSession(folderPath: string, files: string[]) {
  const absolutePath = path.resolve(folderPath);

  // GUARD: The Ultimate Safety - Never touch a folder without the tag
  if (!absolutePath.endsWith(SESSION_TAG)) return;

  for (const file of files) {
    // Only delete specific yt-dlp related extensions
    if (
      file.endsWith(".part") ||
      file.endsWith(".json") ||
      file.endsWith(".ytdl")
    ) {
      await unlink(path.join(absolutePath, file)).catch(() => {});
    }
  }

  await rm(absolutePath, { recursive: false }).catch(() => {});
}

async function updateRegistryFile(folders: string[]) {
  const normalizedFolders = folders.map((f) => path.resolve(f));
  await writeFile(
    GLOBAL_REGISTRY_FILE_PATH,
    JSON.stringify(normalizedFolders, null, 2),
  );
}

/**
 * Completely removes a download session safely.
 * Logic: Verify tag -> Drain folder contents -> Non-recursive folder remove -> Update Registry.
 */
export async function deleteDownloadSession(isolatedSessionFolder: string) {
  try {
    const absoluteTarget = path.resolve(isolatedSessionFolder);
    const folderName = path.basename(absoluteTarget);

    // 1. SIGNATURE GUARD: Mandatory tag check
    // This ensures we only touch folders specifically marked by our app.
    if (!folderName.endsWith(SESSION_TAG)) {
      throw new Error(
        "Safety Block: This folder was not created by the Download Manager.",
      );
    }

    // 2. DIRECTORY GUARD: Prevent deleting sensitive locations
    const projectRoot = path.resolve(process.cwd());
    const isInsideProjectSrc = absoluteTarget.includes(
      path.join(projectRoot, "src"),
    );

    if (absoluteTarget === projectRoot || isInsideProjectSrc) {
      throw new Error("Safety Block: Target is a protected system directory.");
    }

    // 3. THE "DRAIN" STEP: Handle hidden files (.DS_Store, etc.)
    // Instead of recursive rm on the session folder, we remove its children first.
    const allInternalItems = await readdir(absoluteTarget).catch(() => []);

    for (const item of allInternalItems) {
      const itemPath = path.join(absoluteTarget, item);
      // We use recursive here because some items might be sub-folders (like yt-dlp temp dirs)
      // But it's safe because we are locked INSIDE the tagged folder.
      await rm(itemPath, { recursive: true, force: true }).catch(() => {
        // Log if a specific file is locked by another process
        console.warn(`Could not remove internal item: ${item}`);
      });
    }

    // 4. FOLDER REMOVAL: Final cleanup
    // We use recursive: false. If this fails now, it means the OS has a lock
    // on the directory itself (likely yt-dlp is still active).
    await rmdir(absoluteTarget, { recursive: false });

    // 5. REGISTRY UPDATE
    const registryContent = await readFile(
      GLOBAL_REGISTRY_FILE_PATH,
      "utf-8",
    ).catch(() => "[]");

    const trackedFolders: string[] = JSON.parse(registryContent);
    const updatedFolders = trackedFolders.filter(
      (p) => path.resolve(p) !== absoluteTarget,
    );

    await updateRegistryFile(updatedFolders);

    return { success: true };
  } catch (error) {
    console.error(
      `Failed to delete session at ${isolatedSessionFolder}:`,
      error,
    );
    throw error;
  }
}
