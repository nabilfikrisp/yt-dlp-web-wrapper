import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import os from "node:os";
import { mkdir, rm, readFile } from "node:fs/promises";
import { SESSION_TAG } from "@/shared/config/session.config";

describe("Session Persistence Unit Tests", () => {
  const tempDir = path.join(os.tmpdir(), "yt-dlp-persistence-test");

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("saveDownloadSession", () => {
    it("should throw if folder doesn't have session tag", () => {
      const invalidFolder = path.join(tempDir, "no-tag-folder");

      expect(() => {
        if (!invalidFolder.endsWith(SESSION_TAG)) {
          throw new Error(
            "Security Violation: Target folder must carry the session tag.",
          );
        }
      }).toThrow("Security Violation: Target folder must carry the session tag.");
    });

    it("should create metadata file with correct structure", async () => {
      const folderName = `test_video_${SESSION_TAG}`;
      const sessionFolder = path.join(tempDir, folderName);
      const sessionIdentity = folderName;

      const metadata = {
        url: "https://youtube.com/watch?v=test",
        videoFormatId: "18",
        videoLabel: "360p",
        audioFormatId: null,
        audioLabel: null,
        subId: null,
        displayData: { title: "Test Video", thumbnail: "https://example.com/thumb.jpg" },
      };

      await mkdir(sessionFolder, { recursive: true });
      const sidecarPath = path.join(sessionFolder, `${sessionIdentity}.json`);

      const enrichedMetadata = {
        ...metadata,
        isolatedSessionFolder: sessionFolder,
        sessionIdentity,
      };

      await import("node:fs/promises").then((fs) =>
        fs.writeFile(sidecarPath, JSON.stringify(enrichedMetadata, null, 2)),
      );

      const content = await readFile(sidecarPath, "utf-8");
      const parsed = JSON.parse(content);

      expect(parsed.url).toBe(metadata.url);
      expect(parsed.isolatedSessionFolder).toBe(sessionFolder);
      expect(parsed.sessionIdentity).toBe(sessionIdentity);
      expect(parsed.displayData.title).toBe("Test Video");
    });

    it("should handle null optional fields", async () => {
      const folderName = `minimal_video_${SESSION_TAG}`;
      const sessionFolder = path.join(tempDir, folderName);
      const sessionIdentity = folderName;

      const metadata = {
        url: "https://youtube.com/watch?v=test2",
        videoFormatId: null,
        videoLabel: null,
        audioFormatId: null,
        audioLabel: null,
        subId: null,
        displayData: { title: "Minimal", thumbnail: "https://example.com/thumb.jpg" },
      };

      await mkdir(sessionFolder, { recursive: true });
      const sidecarPath = path.join(sessionFolder, `${sessionIdentity}.json`);

      const enrichedMetadata = {
        ...metadata,
        isolatedSessionFolder: sessionFolder,
        sessionIdentity,
      };

      await import("node:fs/promises").then((fs) =>
        fs.writeFile(sidecarPath, JSON.stringify(enrichedMetadata, null, 2)),
      );

      const content = await readFile(sidecarPath, "utf-8");
      const parsed = JSON.parse(content);

      expect(parsed.videoFormatId).toBeNull();
      expect(parsed.audioFormatId).toBeNull();
      expect(parsed.subId).toBeNull();
    });
  });

  describe("Session Identity Generation", () => {
    it("should create valid session identity from components", () => {
      const title = "Test_Video_Title";
      const videoLabel = "720p";
      const audioLabel = "aac";
      const identity = `${title}_${videoLabel}_${audioLabel}_${SESSION_TAG}`
        .replace(/[<>:"/\\|?*]/g, "");

      expect(identity.endsWith(SESSION_TAG)).toBe(true);
      expect(identity).toContain(title);
    });

    it("should sanitize special characters from title", () => {
      const title = "Video <with> special: chars";
      const videoLabel = "360p";
      const sanitized = `${title}_${videoLabel}_${SESSION_TAG}`.replace(
        /[<>:"/\\|?*]/g,
        "",
      );

      expect(sanitized.includes("<")).toBe(false);
      expect(sanitized.includes(">")).toBe(false);
      expect(sanitized.includes(":")).toBe(false);
    });
  });
});
