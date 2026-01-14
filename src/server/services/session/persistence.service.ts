import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DownloadRequest } from "@/features/downloader/validators/download-request.validator";
import { ensureSessionTag } from "./guard.service";
import { addFolderToRegistry } from "./registry.service";
import type { DownloadRequestWithSession } from "./types";

export async function saveDownloadSession(
  isolatedSessionFolder: string,
  sessionIdentity: string,
  downloadMetadata: DownloadRequest,
): Promise<string> {
  ensureSessionTag(isolatedSessionFolder);

  const sidecarMetadataPath = path.join(
    isolatedSessionFolder,
    `${sessionIdentity}.json`,
  );

  await mkdir(isolatedSessionFolder, { recursive: true });

  const metadataValue: DownloadRequestWithSession = {
    ...downloadMetadata,
    isolatedSessionFolder,
    sessionIdentity,
  };
  const serializedMetadata = JSON.stringify(metadataValue, null, 2);
  await writeFile(sidecarMetadataPath, serializedMetadata, "utf-8");

  await addFolderToRegistry(isolatedSessionFolder);

  return sidecarMetadataPath;
}
