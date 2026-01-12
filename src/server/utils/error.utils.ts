import { APP_CONFIG } from "@/shared/config/app.config";
import type { ServerResponse, StreamError } from "@/shared/types/api.types";
import { logger } from "./logger.utils";

export const ERROR_MESSAGES = {
  INVALID_REQUEST_BODY: "Invalid request body",
  INVALID_DOWNLOAD_REQUEST: "Invalid download request payload",
  DOWNLOAD_TIMEOUT: "Download timeout. Please try again.",
  DOWNLOAD_CANCELLED: "Download cancelled",
  NO_RESPONSE_BODY: "No response body",
  UNKNOWN_ERROR: "Unknown error",
  HTTP_ERROR: (status: number) => `HTTP error! status: ${status}`,
  SSE_PARSE_FAILED: "Failed to parse SSE data:",
  NO_FORMAT_SELECTED: "Please select a video or audio format",
  RATE_LIMIT_HIT: "Rate limit hit. Try again in an hour.",
  UNEXPECTED_SERVER_ERROR: "An unexpected server error occurred",
  DIALOG_CANCELLED: "Dialog cancelled",
  DIALOG_FAILED: "Failed to open directory dialog",
  PLATFORM_NOT_SUPPORTED: "Platform not supported for directory picker",
  COMMAND_NOT_FOUND:
    "Required command not found. Install zenity: sudo apt install zenity",
} as const;

export function handleServerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  logger.error(`${message}`);

  return {
    success: false,
    data: null,
    error: message || ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,
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
  return (
    error instanceof Error &&
    error.message === ERROR_MESSAGES.NO_FORMAT_SELECTED
  );
}

export function handleDownloadError(error: unknown): ServerResponse<never> {
  if (isMissingFormatError(error)) {
    return {
      success: false,
      data: null,
      error: ERROR_MESSAGES.NO_FORMAT_SELECTED,
    };
  }

  if (isAbortError(error)) {
    return {
      success: false,
      data: null,
      error: ERROR_MESSAGES.DOWNLOAD_CANCELLED,
    };
  }

  if (isRateLimitError(error)) {
    return {
      success: false,
      data: null,
      error: ERROR_MESSAGES.RATE_LIMIT_HIT,
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
      error: ERROR_MESSAGES.NO_FORMAT_SELECTED,
    };
  }

  if (isAbortError(error)) {
    return {
      type: "error",
      data: null,
      raw: ERROR_MESSAGES.DOWNLOAD_CANCELLED,
      error: ERROR_MESSAGES.DOWNLOAD_CANCELLED,
    };
  }

  if (isRateLimitError(error) && hasSubtitles) {
    return {
      type: "error",
      data: null,
      raw: message,
      error: ERROR_MESSAGES.RATE_LIMIT_HIT,
    };
  }

  return null;
}
