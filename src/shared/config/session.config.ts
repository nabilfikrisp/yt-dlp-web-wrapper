/**
 * A unique, filesystem-safe signature appended to all download session folders.
 * * PURPOSE:
 * 1. Security Guard: Acts as a 'Surgical Strike' identifier. The system will
 * refuse to perform recursive deletes or unlinks on any folder lacking this tag.
 * 2. Collision Avoidance: Prevents overlap with standard user directories.
 * 3. Validation: Used by the Session Service to verify that a path in the
 * registry.json is a legitimate app-managed folder before processing.
 * * CONSTRAINTS:
 * - Must NOT contain characters forbidden by OS filesystems ([<>:"/\\|?*]).
 * - Should be appended AFTER user-input (like video titles) has been sanitized
 * to ensure the tag remains intact and predictable.
 */
export const SESSION_TAG = "---ytdlpwebuisession";
