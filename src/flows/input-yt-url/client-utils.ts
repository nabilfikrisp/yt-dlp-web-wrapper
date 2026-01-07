/**
 * Formats a number of bytes into a human-readable string in megabytes.
 * @returns A string in the format of "X.X MB".
 */
export function formatBitToMB(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
