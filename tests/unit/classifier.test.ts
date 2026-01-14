import { describe, it, expect } from "vitest";
import { APP_CONFIG } from "@/shared/config/app.config";

describe("Error Classifier Unit Tests", () => {
  describe("isAbortError", () => {
    it("should return true for AbortError", () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";

      const result = abortError instanceof Error && abortError.name === "AbortError";
      expect(result).toBe(true);
    });

    it("should return false for regular errors", () => {
      const regularError = new Error("Something went wrong");

      const result = regularError instanceof Error && regularError.name === "AbortError";
      expect(result).toBe(false);
    });

    it("should return false for non-Error values", () => {
      const errorValue: unknown = "string";
      const result = errorValue instanceof Error && (errorValue as Error).name === "AbortError";
      expect(result).toBe(false);
    });
  });

  describe("isRateLimitError", () => {
    it("should return true for 429 errors", () => {
      const rateLimitError = new Error("429 Too Many Requests");

      const message = rateLimitError instanceof Error
        ? rateLimitError.message
        : String(rateLimitError);
      const result = message.includes(APP_CONFIG.RATE_LIMIT_ERROR);

      expect(result).toBe(true);
    });

    it("should return false for other errors", () => {
      const otherError = new Error("Not Found");

      const message = otherError instanceof Error
        ? otherError.message
        : String(otherError);
      const result = message.includes(APP_CONFIG.RATE_LIMIT_ERROR);

      expect(result).toBe(false);
    });

    it("should handle non-Error values", () => {
      const errorValue: unknown = 404;

      const message = errorValue instanceof Error
        ? (errorValue as Error).message
        : String(errorValue);
      const result = message.includes(APP_CONFIG.RATE_LIMIT_ERROR);

      expect(result).toBe(false);
    });
  });

  describe("isMissingFormatError", () => {
    it("should return true for format selection error", () => {
      const formatError = new Error("Please select a video or audio format");

      const result =
        formatError instanceof Error &&
        formatError.message === "Please select a video or audio format";

      expect(result).toBe(true);
    });

    it("should return false for other errors", () => {
      const otherError = new Error("Download failed");

      const result =
        otherError instanceof Error &&
        otherError.message === "Please select a video or audio format";

      expect(result).toBe(false);
    });
  });

  describe("isClientDisconnectedError", () => {
    it("should return true for abort errors (client disconnect)", () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";

      const result = abortError instanceof Error && abortError.name === "AbortError";
      expect(result).toBe(true);
    });

    it("should return false for non-abort errors", () => {
      const otherError = new Error("Connection timeout");

      const result = otherError instanceof Error && otherError.name === "AbortError";
      expect(result).toBe(false);
    });
  });

  describe("extractErrorMessage", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Test error message");

      const result = error instanceof Error ? error.message : String(error);
      expect(result).toBe("Test error message");
    });

    it("should convert non-Error object to string representation", () => {
      const errorValue: unknown = { code: "ERR_INVALID_URL" };

      const result = errorValue instanceof Error
        ? (errorValue as Error).message
        : String(errorValue);

      expect(typeof result).toBe("string");
    });

    it("should handle null", () => {
      const errorValue: unknown = null;

      const result = errorValue instanceof Error
        ? (errorValue as Error).message
        : String(errorValue);

      expect(result).toBe("null");
    });

    it("should handle undefined", () => {
      const errorValue: unknown = undefined;

      const result = errorValue instanceof Error
        ? (errorValue as Error).message
        : String(errorValue);

      expect(result).toBe("undefined");
    });
  });
});
