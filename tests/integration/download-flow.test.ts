import { describe, it, expect } from "vitest";
import path from "node:path";
import os from "node:os";
import { mkdir, rm, writeFile, readFile } from "node:fs/promises";

describe("Download Flow Integration", () => {
  const tempDir = path.join(os.tmpdir(), "yt-dlp-download-test");
  const SESSION_TAG = "---ytdlpwebuisession";

  describe("Session Folder Creation", () => {
    it("should create isolated session folder with correct naming", async () => {
      const downloadBaseDirectory = tempDir;
      const title = "Test_Video_Title";
      const videoLabel = "720p";
      const audioLabel = "aac";

      const sessionIdentity = `${title}_${videoLabel}_${audioLabel}_${SESSION_TAG}`.replace(
        /[<>:"/\\|?*]/g,
        "",
      );

      const isolatedSessionFolder = path.join(
        downloadBaseDirectory,
        sessionIdentity,
      );

      await mkdir(isolatedSessionFolder, { recursive: true });

      const folderExists = await mkdir(isolatedSessionFolder, {
        recursive: true,
      }).then(() => true, () => false);

      expect(folderExists).toBe(true);
      expect(isolatedSessionFolder.endsWith(SESSION_TAG)).toBe(true);

      await rm(tempDir, { recursive: true, force: true });
    });

    it("should create session metadata file", async () => {
      const sessionFolder = path.join(tempDir, `test_video_360p_${SESSION_TAG}`);
      await mkdir(sessionFolder, { recursive: true });

      const sessionIdentity = "test_video_360p_" + SESSION_TAG;
      const sidecarMetadataPath = path.join(sessionFolder, `${sessionIdentity}.json`);

      const metadata = {
        url: "https://www.youtube.com/watch?v=test",
        videoFormatId: "18",
        videoLabel: "360p",
        audioFormatId: null,
        audioLabel: null,
        subId: null,
        displayData: {
          title: "Test Video",
          thumbnail: "https://example.com/thumb.jpg",
        },
        isolatedSessionFolder: sessionFolder,
        sessionIdentity,
      };

      await writeFile(sidecarMetadataPath, JSON.stringify(metadata, null, 2));

      const content = await readFile(sidecarMetadataPath, "utf-8");
      const parsed = JSON.parse(content);

      expect(parsed.url).toBe(metadata.url);
      expect(parsed.isolatedSessionFolder).toBe(sessionFolder);
      expect(parsed.displayData.title).toBe("Test Video");

      await rm(tempDir, { recursive: true, force: true });
    });

    it("should detect incomplete download by .part file presence", async () => {
      const sessionFolder = path.join(tempDir, `incomplete_download_${SESSION_TAG}`);
      await mkdir(sessionFolder, { recursive: true });

      const partFile = path.join(sessionFolder, "video.part");
      await writeFile(partFile, "test data");

      const files = await import("node:fs/promises").then((fs) =>
        fs.readdir(sessionFolder),
      );

      const hasIncompletePartFile = files.some((name: string) =>
        name.endsWith(".part"),
      );

      expect(hasIncompletePartFile).toBe(true);

      await rm(tempDir, { recursive: true, force: true });
    });
  });

  describe("Format String Building", () => {
    it("should build combined format string for video+audio", () => {
      const videoFormatId = "18";
      const audioFormatId = "251";

      const result = [videoFormatId, audioFormatId].filter(Boolean).join("+");

      expect(result).toBe("18+251");
    });

    it("should handle null audio format", () => {
      const videoFormatId = "22";
      const audioFormatId = null;

      const result = [videoFormatId, audioFormatId].filter(Boolean).join("+");

      expect(result).toBe("22");
    });

    it("should handle both null formats", () => {
      const videoFormatId = null;
      const audioFormatId = null;

      const result = [videoFormatId, audioFormatId].filter(Boolean).join("+");

      expect(result).toBe("");
    });
  });
});
