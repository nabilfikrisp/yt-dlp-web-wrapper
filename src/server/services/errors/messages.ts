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

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
