import type { ServerResponse, StreamError } from "@/shared/types/api.types";
import {
  isAbortError,
  isMissingFormatError,
  isRateLimitError,
} from "./classifier";
import { ERROR_MESSAGES } from "./messages";

export function toServerErrorResponse(error: unknown): ServerResponse<never> {
  const message = isAbortError(error)
    ? ERROR_MESSAGES.DOWNLOAD_CANCELLED
    : ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR;

  return {
    success: false,
    data: null,
    error: message,
  };
}

export function toDownloadErrorResponse(error: unknown): ServerResponse<never> {
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

  return toServerErrorResponse(error);
}

export function toStreamError(
  error: unknown,
  hasSubtitles: boolean,
): StreamError | null {
  const message = isAbortError(error)
    ? ERROR_MESSAGES.DOWNLOAD_CANCELLED
    : isMissingFormatError(error)
      ? ERROR_MESSAGES.NO_FORMAT_SELECTED
      : isRateLimitError(error) && hasSubtitles
        ? ERROR_MESSAGES.RATE_LIMIT_HIT
        : null;

  if (!message) {
    return null;
  }

  const rawMessage = error instanceof Error ? error.message : String(error);

  return {
    type: "error",
    data: null,
    raw: rawMessage,
    error: message,
  };
}
