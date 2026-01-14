import { APP_CONFIG } from "@/shared/config/app.config";

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes(APP_CONFIG.RATE_LIMIT_ERROR);
}

export function isMissingFormatError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === "Please select a video or audio format"
  );
}

export function isClientDisconnectedError(error: unknown): boolean {
  return isAbortError(error);
}

export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
