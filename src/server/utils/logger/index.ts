import {
  isAbortError,
  isRateLimitError,
} from "../../services/errors/classifier";
import { type LogLevel, shouldLog } from "./config";

function formatMessage(
  level: LogLevel,
  msg: string,
  meta?: Record<string, unknown>,
): string {
  return JSON.stringify({ level, msg, ...meta });
}

function formatError(
  level: LogLevel,
  msg: string,
  err: unknown,
  meta?: Record<string, unknown>,
): string {
  const errorInfo: Record<string, unknown> = { ...meta };

  if (err instanceof Error) {
    errorInfo.error = err.message;
    errorInfo.stack = err.stack;
    errorInfo.name = err.name;

    if (isAbortError(err)) {
      errorInfo.errorType = "abort";
    } else if (isRateLimitError(err)) {
      errorInfo.errorType = "rate_limit";
    } else {
      errorInfo.errorType = "general";
    }
  } else {
    errorInfo.error = String(err);
    errorInfo.errorType = "unknown";
  }

  return JSON.stringify({ level, msg, ...errorInfo });
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>): void => {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", msg, meta));
    }
  },

  info: (msg: string, meta?: Record<string, unknown>): void => {
    if (shouldLog("info")) {
      console.log(formatMessage("info", msg, meta));
    }
  },

  warn: (msg: string, meta?: Record<string, unknown>): void => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", msg, meta));
    }
  },

  error: (msg: string, err?: unknown, meta?: Record<string, unknown>): void => {
    if (shouldLog("error")) {
      console.error(formatError("error", msg, err, meta));
    }
  },
};
