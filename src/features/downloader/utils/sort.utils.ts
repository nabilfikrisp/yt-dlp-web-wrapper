import type { Subtitle } from "../types/video-metadata.types";

export function sortSubtitles(subtitles: Subtitle[]): Subtitle[] {
  const hqIds = new Set(subtitles.filter((s) => !s.isAuto).map((s) => s.id));

  const filtered = subtitles.filter((s) => !s.isAuto || !hqIds.has(s.id));

  return [...filtered].sort((a, b) => {
    if (a.isAuto !== b.isAuto) return a.isAuto ? 1 : -1;
    const aIsEn = a.id.toLowerCase().startsWith("en");
    const bIsEn = b.id.toLowerCase().startsWith("en");
    if (aIsEn && !bIsEn) return -1;
    if (!aIsEn && bIsEn) return 1;
    return a.id.localeCompare(b.id);
  });
}

export function sortByFilesize<T extends { filesize?: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => (b.filesize || 0) - (a.filesize || 0));
}
