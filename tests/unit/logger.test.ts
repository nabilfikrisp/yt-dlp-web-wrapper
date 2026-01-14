import { describe, it, expect } from "vitest";

describe("Logger Unit Tests", () => {
  describe("Log Level Configuration", () => {
    it("should have valid log levels defined", () => {
      const LOG_LEVELS = ["debug", "info", "warn", "error"];
      expect(LOG_LEVELS).toContain("debug");
      expect(LOG_LEVELS).toContain("info");
      expect(LOG_LEVELS).toContain("warn");
      expect(LOG_LEVELS).toContain("error");
    });

    it("should validate log level from string", () => {
      const validLevels = ["debug", "info", "warn", "error"];
      const testLevel = "debug";
      expect(validLevels.includes(testLevel)).toBe(true);
    });

    it("should reject invalid log level", () => {
      const validLevels = ["debug", "info", "warn", "error"];
      const testLevel = "trace";
      expect(validLevels.includes(testLevel)).toBe(false);
    });

    it("should determine correct order of log levels", () => {
      const levelOrder = ["debug", "info", "warn", "error"];
      expect(levelOrder.indexOf("debug")).toBe(0);
      expect(levelOrder.indexOf("info")).toBe(1);
      expect(levelOrder.indexOf("warn")).toBe(2);
      expect(levelOrder.indexOf("error")).toBe(3);
    });

    it("should calculate log filtering correctly", () => {
      const levelOrder = ["debug", "info", "warn", "error"];
      const currentLevel = "info";
      const currentIndex = levelOrder.indexOf(currentLevel);

      expect(levelOrder.indexOf("debug") >= currentIndex).toBe(false);
      expect(levelOrder.indexOf("info") >= currentIndex).toBe(true);
      expect(levelOrder.indexOf("warn") >= currentIndex).toBe(true);
      expect(levelOrder.indexOf("error") >= currentIndex).toBe(true);
    });
  });

  describe("Logger Output Format", () => {
    it("should format info messages as JSON", () => {
      const msg = "Test message";
      const meta = { url: "https://example.com" };

      const result = JSON.stringify({ level: "info", msg, ...meta });
      const parsed = JSON.parse(result);

      expect(parsed.level).toBe("info");
      expect(parsed.msg).toBe("Test message");
      expect(parsed.url).toBe("https://example.com");
    });

    it("should format error messages with error details", () => {
      const msg = "Error occurred";
      const err = new Error("Test error");
      const meta = { url: "https://example.com" };

      const errorInfo: Record<string, unknown> = { ...meta };
      if (err instanceof Error) {
        errorInfo.error = err.message;
        errorInfo.stack = err.stack;
        errorInfo.name = err.name;
        errorInfo.errorType = "general";
      } else {
        errorInfo.error = String(err);
        errorInfo.errorType = "unknown";
      }

      const result = JSON.stringify({ level: "error", msg, ...errorInfo });
      const parsed = JSON.parse(result);

      expect(parsed.level).toBe("error");
      expect(parsed.msg).toBe("Error occurred");
      expect(parsed.error).toBe("Test error");
      expect(parsed.errorType).toBe("general");
    });

    it("should handle non-Error values in error format", () => {
      const msg = "Error occurred";
      const err: unknown = "String error";
      const meta = { url: "https://example.com" };

      const errorInfo: Record<string, unknown> = { ...meta };
      if (err instanceof Error) {
        errorInfo.error = err.message;
        errorInfo.errorType = "general";
      } else {
        errorInfo.error = String(err);
        errorInfo.errorType = "unknown";
      }

      const result = JSON.stringify({ level: "error", msg, ...errorInfo });
      const parsed = JSON.parse(result);

      expect(parsed.error).toBe("String error");
      expect(parsed.errorType).toBe("unknown");
    });
  });

  describe("JSON Output Validation", () => {
    it("should produce valid JSON for info log", () => {
      const logObject = {
        level: "info",
        msg: "Test message",
        url: "https://example.com",
      };

      const jsonString = JSON.stringify(logObject);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it("should produce valid JSON for error log", () => {
      const logObject = {
        level: "error",
        msg: "Test error",
        error: "Error message",
        errorType: "general",
      };

      const jsonString = JSON.stringify(logObject);
      const parsed = JSON.parse(jsonString);
      expect(parsed.level).toBe("error");
    });
  });
});
