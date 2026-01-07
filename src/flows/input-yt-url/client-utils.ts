/**
 * Formats a number of bytes into a human-readable string in megabytes.
 * @returns A string in the format of "X.X MB".
 */
export function formatBitToMB(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Formats a number of seconds into a human-readable string in the format of H:MM:SS or M:SS.
 * If the input is invalid (i.e., not a number or less than 0), returns "0:00".
 * @returns A string in the format of H:MM:SS or M:SS.
 * @example
 * formatDuration(3661) // "1:01:01"
 * formatDuration(61) // "1:01"
 */
export function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return "0:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const paddedSecs = secs.toString().padStart(2, "0");

  if (hrs > 0) {
    // Format: H:MM:SS (e.g., 1:05:02)
    const paddedMins = mins.toString().padStart(2, "0");
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  // Format: M:SS (e.g., 5:02)
  return `${mins}:${paddedSecs}`;
}
