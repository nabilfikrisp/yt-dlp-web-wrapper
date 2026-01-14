import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const GLOBAL_REGISTRY_FILE_PATH = path.resolve(
  process.cwd(),
  "storage",
  "registry",
  "registry.json",
);

export async function readRegistry(): Promise<string[]> {
  const content = await readFile(GLOBAL_REGISTRY_FILE_PATH, "utf-8").catch(
    () => "[]",
  );
  return JSON.parse(content);
}

export async function writeRegistry(folders: string[]): Promise<void> {
  const normalizedFolders = folders.map((f) => path.resolve(f));
  await writeFile(
    GLOBAL_REGISTRY_FILE_PATH,
    JSON.stringify(normalizedFolders, null, 2),
  );
}

export async function ensureRegistryDirectory(): Promise<void> {
  const registryDirectory = path.dirname(GLOBAL_REGISTRY_FILE_PATH);
  await mkdir(registryDirectory, { recursive: true });
}

export async function addFolderToRegistry(folderPath: string): Promise<void> {
  const absolutePath = path.resolve(folderPath);
  await ensureRegistryDirectory();

  const trackedSessionFolders = await readRegistry();

  const isAlreadyTracked = trackedSessionFolders.some(
    (p) => path.resolve(p) === absolutePath,
  );

  if (!isAlreadyTracked) {
    trackedSessionFolders.push(absolutePath);
    await writeRegistry(trackedSessionFolders);
  }
}

export async function removeFolderFromRegistry(
  folderPath: string,
): Promise<void> {
  const absoluteTarget = path.resolve(folderPath);
  const trackedFolders = await readRegistry();

  const updatedFolders = trackedFolders.filter(
    (p) => path.resolve(p) !== absoluteTarget,
  );

  await writeRegistry(updatedFolders);
}
