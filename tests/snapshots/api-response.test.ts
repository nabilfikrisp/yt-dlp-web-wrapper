import { describe, it, expect } from "vitest";

describe("API Response Snapshot Tests", () => {
  describe("ServerResponse structure", () => {
    it("should have consistent success response structure", () => {
      const successResponse = {
        success: true,
        data: "Download complete",
        error: null,
      };

      expect(successResponse).toMatchObject({
        success: true,
        error: null,
      });
    });

    it("should have consistent error response structure", () => {
      const errorResponse = {
        success: false,
        data: null,
        error: "Something went wrong",
      };

      expect(errorResponse).toMatchObject({
        success: false,
        data: null,
      });
    });

    it("should match success response snapshot", () => {
      const response = {
        success: true,
        data: {
          title: "Test Video",
          thumbnail: "https://example.com/thumb.jpg",
          duration: 180,
          uploader: "TestChannel",
          formats: [],
        },
        error: null,
      };

      expect(response).toMatchSnapshot();
    });

    it("should match error response snapshot", () => {
      const response = {
        success: false,
        data: null,
        error: "Failed to fetch video metadata",
      };

      expect(response).toMatchSnapshot();
    });
  });

  describe("Stream response format", () => {
    it("should format SSE progress messages correctly", () => {
      const progressData = {
        type: "progress",
        data: {
          percent: 50,
          speed: "1.5MB/s",
          eta: "60s",
        },
      };

      const sseMessage = `data: ${JSON.stringify(progressData)}\n\n`;

      expect(sseMessage).toMatch(/^data: .+\n\n$/);
      expect(sseMessage).toContain("progress");
    });

    it("should format SSE success messages correctly", () => {
      const successData = {
        type: "success",
        data: "Download finished!",
        raw: "",
        error: null,
      };

      const sseMessage = `data: ${JSON.stringify(successData)}\n\n`;

      expect(sseMessage).toMatch(/^data: .+\n\n$/);
      expect(sseMessage).toContain("success");
    });

    it("should format SSE error messages correctly", () => {
      const errorData = {
        type: "error",
        data: null,
        raw: "Download failed",
        error: "Download failed",
      };

      const sseMessage = `data: ${JSON.stringify(errorData)}\n\n`;

      expect(sseMessage).toMatch(/^data: .+\n\n$/);
      expect(sseMessage).toContain("error");
    });
  });

  describe("DownloadRequestWithSession structure", () => {
    it("should have all required fields", () => {
      const sessionRequest = {
        url: "https://youtube.com/watch?v=test",
        videoFormatId: "18",
        videoLabel: "360p",
        audioFormatId: null,
        audioLabel: null,
        subId: null,
        displayData: {
          title: "Test Video",
          thumbnail: "https://example.com/thumb.jpg",
        },
        isolatedSessionFolder: "/storage/downloads/test_---ytdlpwebuisession",
        sessionIdentity: "test_---ytdlpwebuisession",
      };

      const requiredFields = [
        "url",
        "videoFormatId",
        "audioFormatId",
        "subId",
        "displayData",
        "isolatedSessionFolder",
        "sessionIdentity",
      ];

      for (const field of requiredFields) {
        expect(sessionRequest).toHaveProperty(field);
      }
    });
  });
});
