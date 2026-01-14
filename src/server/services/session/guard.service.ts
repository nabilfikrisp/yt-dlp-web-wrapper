import path from "node:path";
import { SESSION_TAG } from "@/shared/config/session.config";

export function ensureSessionTag(folderPath: string): void {
  if (!folderPath.endsWith(SESSION_TAG)) {
    throw new Error(
      "Security Violation: Target folder must carry the session tag.",
    );
  }
}

export function isValidSessionFolder(folderPath: string): boolean {
  const absolutePath = path.resolve(folderPath);
  return absolutePath.endsWith(SESSION_TAG);
}

export function isProtectedPath(targetPath: string): boolean {
  const absoluteTarget = path.resolve(targetPath);
  const projectRoot = path.resolve(process.cwd());

  const isInsideProjectSrc = absoluteTarget.includes(
    path.join(projectRoot, "src"),
  );

  return absoluteTarget === projectRoot || isInsideProjectSrc;
}

export function getFolderName(folderPath: string): string {
  return path.basename(path.resolve(folderPath));
}

export function isSessionFolderName(folderName: string): boolean {
  return folderName.endsWith(SESSION_TAG);
}
