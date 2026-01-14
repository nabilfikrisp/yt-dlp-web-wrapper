export type LogLevel = "debug" | "info" | "warn" | "error";

export const LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];

export function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && LOG_LEVELS.includes(envLevel)) {
    return envLevel;
  }
  return "info";
}

export function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  const currentIndex = LOG_LEVELS.indexOf(currentLevel);
  const messageIndex = LOG_LEVELS.indexOf(level);
  return messageIndex >= currentIndex;
}
