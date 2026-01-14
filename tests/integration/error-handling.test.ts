import { describe, it, expect } from "vitest";
import { downloadRequestSchema } from "@/features/downloader/validators/download-request.validator";

describe("API Validation Integration", () => {
  describe("downloadRequestSchema", () => {
    it("should validate a correct download request", () => {
      const validRequest = {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoFormatId: "18",
        videoLabel: "360p",
        audioFormatId: null,
        audioLabel: null,
        subId: null,
        downloadPath: "/storage/downloads",
        displayData: {
          title: "Test Video",
          thumbnail: "https://example.com/thumb.jpg",
        },
      };

      const result = downloadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject a request without URL", () => {
      const invalidRequest = {
        videoFormatId: "18",
        displayData: {
          title: "Test Video",
          thumbnail: "https://example.com/thumb.jpg",
        },
      };

      const result = downloadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject a request with invalid URL format", () => {
      const invalidRequest = {
        url: "not-a-valid-url",
        videoFormatId: "18",
        displayData: {
          title: "Test Video",
          thumbnail: "https://example.com/thumb.jpg",
        },
      };

      const result = downloadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should accept a minimal request with required fields", () => {
      const minimalRequest = {
        url: "https://www.youtube.com/watch?v=test",
        videoFormatId: null,
        videoLabel: null,
        audioFormatId: null,
        audioLabel: null,
        subId: null,
        displayData: {
          title: "Minimal Video",
          thumbnail: "https://example.com/thumb.jpg",
        },
      };

      const result = downloadRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
    });

    it("should reject a request without displayData", () => {
      const invalidRequest = {
        url: "https://www.youtube.com/watch?v=test",
        videoFormatId: "18",
      };

      const result = downloadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject a request with empty displayData title", () => {
      const invalidRequest = {
        url: "https://www.youtube.com/watch?v=test",
        videoFormatId: "18",
        displayData: {
          title: "",
          thumbnail: "https://example.com/thumb.jpg",
        },
      };

      const result = downloadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
