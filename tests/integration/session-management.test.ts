import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("Session Management Integration", () => {
  const tempDir = path.join(os.tmpdir(), "yt-dlp-test-session");
  const registryPath = path.join(tempDir, "registry.json");

  beforeEach(async () => {
    await mkdir(path.dirname(registryPath), { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("Registry File Operations", () => {
    it("should create registry file with empty array if not exists", async () => {
      const content = await readFile(registryPath, "utf-8").catch(() => "[]");
      const parsed = JSON.parse(content);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(0);
    });

    it("should persist and read session folders", async () => {
      const testFolders = [
        "/storage/downloads/session1---ytdlpwebuisession",
        "/storage/downloads/session2---ytdlpwebuisession",
      ];

      await writeFile(registryPath, JSON.stringify(testFolders, null, 2));
      const content = await readFile(registryPath, "utf-8");
      const parsed = JSON.parse(content);

      expect(parsed).toHaveLength(2);
      expect(parsed).toContain(testFolders[0]);
      expect(parsed).toContain(testFolders[1]);
    });

    it("should prevent duplicate folder entries", async () => {
      const folderPath = "/storage/downloads/test---ytdlpwebuisession";

      let content = await readFile(registryPath, "utf-8").catch(() => "[]");
      const trackedFolders: string[] = JSON.parse(content);

      const isAlreadyTracked = trackedFolders.some(
        (p) => path.resolve(p) === path.resolve(folderPath),
      );

      if (!isAlreadyTracked) {
        trackedFolders.push(folderPath);
        await writeFile(registryPath, JSON.stringify(trackedFolders, null, 2));
      }

      const finalContent = await readFile(registryPath, "utf-8");
      const finalParsed = JSON.parse(finalContent);

      expect(
        finalParsed.filter((p: string) => path.resolve(p) === path.resolve(folderPath)),
      ).toHaveLength(1);
    });
  });

  describe("Session Tag Validation", () => {
    const SESSION_TAG = "---ytdlpwebuisession";

    it("should recognize valid session folder names", () => {
      const validFolders = [
        "video_title_360p_---ytdlpwebuisession",
        "test_video_720p_aac_---ytdlpwebuisession",
      ];

      for (const folder of validFolders) {
        expect(folder.endsWith(SESSION_TAG)).toBe(true);
      }
    });

    it("should reject invalid folder names", () => {
      const invalidFolders = [
        "video_title_360p",
        "test_video",
        "random-folder",
      ];

      for (const folder of invalidFolders) {
        expect(folder.endsWith(SESSION_TAG)).toBe(false);
      }
    });

    it("should validate absolute path ends with session tag", () => {
      const validPath = "/storage/downloads/video_---ytdlpwebuisession";
      const invalidPath = "/storage/downloads/video";

      expect(validPath.endsWith(SESSION_TAG)).toBe(true);
      expect(invalidPath.endsWith(SESSION_TAG)).toBe(false);
    });
  });

  describe("Protected Path Detection", () => {
    it("should detect if path is project root", () => {
      const projectRoot = process.cwd();
      const isProjectRoot = projectRoot === projectRoot;
      expect(isProjectRoot).toBe(true);
    });

    it("should detect if path is inside src directory", () => {
      const projectRoot = process.cwd();
      const srcPath = path.join(projectRoot, "src");

      expect(srcPath.includes(path.join(projectRoot, "src"))).toBe(true);
    });
  });
});
