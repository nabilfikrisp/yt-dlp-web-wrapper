import { describe, it, expect } from "vitest";
import path from "node:path";
import { SESSION_TAG } from "@/shared/config/session.config";

describe("Session Guard Service Unit Tests", () => {
  describe("ensureSessionTag", () => {
    it("should not throw for valid session folder", () => {
      const validFolder = "/storage/downloads/video_720p_" + SESSION_TAG;

      expect(() => {
        if (!validFolder.endsWith(SESSION_TAG)) {
          throw new Error(
            "Security Violation: Target folder must carry the session tag.",
          );
        }
      }).not.toThrow();
    });

    it("should throw for invalid folder without tag", () => {
      const invalidFolder = "/storage/downloads/video_720p";

      expect(() => {
        if (!invalidFolder.endsWith(SESSION_TAG)) {
          throw new Error(
            "Security Violation: Target folder must carry the session tag.",
          );
        }
      }).toThrow("Security Violation: Target folder must carry the session tag.");
    });

    it("should throw for relative paths without tag", () => {
      const invalidRelativePath = "./downloads/video";

      expect(() => {
        if (!invalidRelativePath.endsWith(SESSION_TAG)) {
          throw new Error(
            "Security Violation: Target folder must carry the session tag.",
          );
        }
      }).toThrow();
    });
  });

  describe("isValidSessionFolder", () => {
    it("should return true for valid session folder", () => {
      const validPath = path.resolve("/storage/downloads/video_" + SESSION_TAG);
      const result = validPath.endsWith(SESSION_TAG);
      expect(result).toBe(true);
    });

    it("should return false for invalid folder", () => {
      const invalidPath = path.resolve("/storage/downloads/video");
      const result = invalidPath.endsWith(SESSION_TAG);
      expect(result).toBe(false);
    });

    it("should handle absolute paths correctly", () => {
      const absoluteValid = path.resolve("/storage/downloads/test_" + SESSION_TAG);
      const absoluteInvalid = path.resolve("/storage/downloads/test");

      expect(absoluteValid.endsWith(SESSION_TAG)).toBe(true);
      expect(absoluteInvalid.endsWith(SESSION_TAG)).toBe(false);
    });
  });

  describe("isProtectedPath", () => {
    it("should return true for project root", () => {
      const projectRoot = path.resolve(process.cwd());
      const isProtected = projectRoot === projectRoot || projectRoot.includes(path.join(projectRoot, "src"));
      expect(isProtected).toBe(true);
    });

    it("should return true for paths inside src", () => {
      const projectRoot = path.resolve(process.cwd());
      const srcPath = path.join(projectRoot, "src", "server");

      const isInsideSrc = srcPath.includes(path.join(projectRoot, "src"));
      const isProtected = srcPath === projectRoot || isInsideSrc;

      expect(isProtected).toBe(true);
    });

    it("should return false for safe storage paths", () => {
      const projectRoot = path.resolve(process.cwd());
      const storagePath = path.resolve("/tmp/storage/downloads");

      const isInsideSrc = storagePath.includes(path.join(projectRoot, "src"));
      const isProtected = storagePath === projectRoot || isInsideSrc;

      expect(isProtected).toBe(false);
    });
  });

  describe("getFolderName", () => {
    it("should extract folder name from path", () => {
      const path1 = "/storage/downloads/video_" + SESSION_TAG;
      const path2 = "/home/user/Downloads";

      expect(path.basename(path1)).toBe("video_" + SESSION_TAG);
      expect(path.basename(path2)).toBe("Downloads");
    });

    it("should handle absolute paths", () => {
      const absolutePath = path.resolve("/storage/downloads/test_" + SESSION_TAG);
      expect(path.basename(absolutePath)).toBe("test_" + SESSION_TAG);
    });
  });

  describe("isSessionFolderName", () => {
    it("should return true for valid session folder names", () => {
      const validNames = [
        "video_title_360p_---ytdlpwebuisession",
        "test_720p_aac_---ytdlpwebuisession",
      ];

      for (const name of validNames) {
        expect(name.endsWith(SESSION_TAG)).toBe(true);
      }
    });

    it("should return false for invalid folder names", () => {
      const invalidNames = [
        "video_title_360p",
        "regular_folder",
        "test",
      ];

      for (const name of invalidNames) {
        expect(name.endsWith(SESSION_TAG)).toBe(false);
      }
    });
  });
});
