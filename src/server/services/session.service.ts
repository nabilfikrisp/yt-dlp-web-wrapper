import {
  mkdir,
  readdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";

const GLOBAL_REGISTRY_FILE_PATH = path.join(
  process.cwd(),
  "storage",
  "registry",
  "registry.json",
);

/**
 * Persists the download metadata locally as a sidecar and bookmarks the
 * folder location in the global registry to enable later resumption.
 */
export async function saveDownloadSession(
  isolatedSessionFolder: string,
  sessionIdentity: string,
  downloadMetadata: DownloadRequest,
) {
  const sidecarMetadataPath = path.join(
    isolatedSessionFolder,
    `${sessionIdentity}.json`,
  );

  try {
    // 1. Prepare the physical location
    await mkdir(isolatedSessionFolder, { recursive: true });

    // 2. Save the local sidecar (The data source for this specific video)
    const serializedMetadata = JSON.stringify(downloadMetadata, null, 2);
    await writeFile(sidecarMetadataPath, serializedMetadata, "utf-8");

    // 3. Link this folder to the global lookup list
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

/**
 * Internal helper to ensure the app 'remembers' where this session lives. This function tied to saveDownloadSession
 */
async function bookmarkSessionFolderInRegistry(folderPath: string) {
  const registryDirectory = path.dirname(GLOBAL_REGISTRY_FILE_PATH);
  await mkdir(registryDirectory, { recursive: true });

  const existingRegistryContent = await readFile(
    GLOBAL_REGISTRY_FILE_PATH,
    "utf-8",
  ).catch(() => "[]");
  const trackedSessionFolders: string[] = JSON.parse(existingRegistryContent);

  const isAlreadyTracked = trackedSessionFolders.includes(folderPath);

  if (!isAlreadyTracked) {
    trackedSessionFolders.push(folderPath);
    const updatedRegistryJson = JSON.stringify(trackedSessionFolders, null, 2);
    await writeFile(GLOBAL_REGISTRY_FILE_PATH, updatedRegistryJson, "utf-8");
  }
}

export async function getUnfinishedDownloads(): Promise<DownloadRequest[]> {
  const registryContent = await readFile(
    GLOBAL_REGISTRY_FILE_PATH,
    "utf-8",
  ).catch(() => "[]");
  const trackedSessionFolders: string[] = JSON.parse(registryContent);

  const activeDownloads: DownloadRequest[] = [];
  const validFoldersToKeep: string[] = [];

  for (const sessionFolder of trackedSessionFolders) {
    try {
      const folderFiles = await readdir(sessionFolder);

      const sidecarJsonName = folderFiles.find((name) =>
        name.endsWith(".json"),
      );
      const hasIncompletePartFile = folderFiles.some((name) =>
        name.endsWith(".part"),
      );

      /**
       * RECONCILIATION LOGIC (Old syncDiskSessions)
       * If both files exist, it's a valid session.
       * If one is missing, it's an orphan and we clean it up.
       */
      if (sidecarJsonName && hasIncompletePartFile) {
        const sidecarPath = path.join(sessionFolder, sidecarJsonName);
        const metadataContent = await readFile(sidecarPath, "utf-8");

        activeDownloads.push({
          ...JSON.parse(metadataContent),
          storagePath: sessionFolder,
        });

        validFoldersToKeep.push(sessionFolder);
      } else {
        // Clean up orphaned files within the folder
        await cleanupOrphanedSession(sessionFolder, folderFiles);
      }
    } catch (_) {
      // Folder was moved or deleted; automatically pruned by not adding to validFoldersToKeep
    }
  }

  // Update registry: Removes references to finished, deleted, or orphaned sessions
  await updateRegistryFile(validFoldersToKeep);

  return activeDownloads;
}

/**
 * Self-Documenting Helper: Cleans up partial files if the metadata is lost
 */
async function cleanupOrphanedSession(folderPath: string, files: string[]) {
  for (const file of files) {
    if (file.endsWith(".part") || file.endsWith(".json")) {
      await unlink(path.join(folderPath, file)).catch(() => {});
    }
  }
  // Optionally remove the empty directory
  await rm(folderPath, { recursive: true, force: true }).catch(() => {});
}

async function updateRegistryFile(folders: string[]) {
  await writeFile(GLOBAL_REGISTRY_FILE_PATH, JSON.stringify(folders, null, 2));
}
