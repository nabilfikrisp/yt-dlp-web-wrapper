export const PROGRESS_PATTERN = /(\d+\.\d+)%/;
export const NEWLINE_ARGS = ["--newline"] as const;
export const RATE_LIMIT_INDICATOR = "429";

export interface ParsedProgress {
  percentage: number;
  raw: string;
}

export function parseProgressLine(line: string): ParsedProgress | null {
  const match = line.match(PROGRESS_PATTERN);
  if (!match) {
    return null;
  }
  return {
    percentage: parseFloat(match[1]),
    raw: line.trim(),
  };
}

export function isRateLimitMessage(output: string): boolean {
  return output.includes(RATE_LIMIT_INDICATOR);
}
