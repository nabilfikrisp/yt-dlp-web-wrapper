import { APP_CONFIG } from "@/shared/config/app.config";
import type { ServerResponse, StreamError } from "@/shared/types/api.types";
import { logger } from "./logger.utils";

export function handleServerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  logger.error(`${message}`);

  return {
    success: false,
    data: null,
    error: message || "An unexpected server error occurred",
  };
}

export function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes(APP_CONFIG.RATE_LIMIT_ERROR);
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function isMissingFormatError(error: unknown): boolean {
  return error instanceof Error && error.message === "No format selected";
}

export function handleDownloadError(error: unknown): ServerResponse<never> {
  if (isMissingFormatError(error)) {
    return {
      success: false,
      data: null,
      error: "Please select a video or audio format",
    };
  }

  if (isAbortError(error)) {
    return { success: false, data: null, error: "Download cancelled" };
  }

  if (isRateLimitError(error)) {
    return {
      success: false,
      data: null,
      error: "Rate limit hit. Try again in an hour.",
    };
  }

  return handleServerError(error);
}

export function handleStreamError(
  error: unknown,
  hasSubtitles: boolean,
): StreamError | null {
  const message = error instanceof Error ? error.message : String(error);

  if (isMissingFormatError(error)) {
    return {
      type: "error",
      data: null,
      raw: message,
      error: "Please select a video or audio format",
    };
  }

  if (isAbortError(error)) {
    return {
      type: "error",
      data: null,
      raw: "Download cancelled",
      error: "Download was cancelled",
    };
  }

  if (isRateLimitError(error) && hasSubtitles) {
    return {
      type: "error",
      data: null,
      raw: message,
      error: "Rate limit hit. Try again in an hour.",
    };
  }

  return null;
}
