import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("Metadata Snapshot Tests", () => {
  const sampleMetadata = JSON.parse(
    readFileSync(
      path.join(__dirname, "../fixtures/sample-metadata.json"),
      "utf-8",
    ),
  );

  it("should transform yt-dlp output to expected metadata structure", () => {
    const transformed = {
      title: sampleMetadata.title,
      thumbnail: sampleMetadata.thumbnail,
      duration: sampleMetadata.duration,
      uploader: sampleMetadata.uploader,
      formats: sampleMetadata.formats.map((f: {
        format_id: string;
        vcodec: string;
        acodec: string;
        ext: string;
        resolution?: string;
        filesize?: number;
        format_note?: string;
      }) => ({
        formatId: f.format_id,
        codec: f.vcodec !== "none" ? f.vcodec : null,
        audioCodec: f.acodec !== "none" ? f.acodec : null,
        extension: f.ext,
        resolution: f.resolution,
        filesize: f.filesize,
        formatNote: f.format_note,
      })),
    };

    expect(transformed).toMatchSnapshot({
      formats: expect.arrayContaining([
        expect.objectContaining({
          formatId: "18",
          extension: "mp4",
        }),
      ]),
    });
  });

  it("should correctly map format properties", () => {
    const videoFormat = sampleMetadata.formats[0];

    const mapped = {
      formatId: videoFormat.format_id,
      videoCodec: videoFormat.vcodec !== "none" ? videoFormat.vcodec : null,
      audioCodec: videoFormat.acodec !== "none" ? videoFormat.acodec : null,
      extension: videoFormat.ext,
      resolution: videoFormat.resolution,
      filesize: videoFormat.filesize,
    };

    expect(mapped).toEqual({
      formatId: "18",
      videoCodec: "avc1.42001E",
      audioCodec: "mp4a.40.2",
      extension: "mp4",
      resolution: "640x360",
      filesize: 12000000,
    });
  });

    it("should handle audio-only format correctly", () => {
      const audioFormat = sampleMetadata.formats.find(
        (f: { format_note?: string }) => f.format_note === "audio only",
      );

      expect(audioFormat).toBeDefined();
      expect(audioFormat.vcodec).toBe("none");
      expect(audioFormat.acodec).not.toBe("none");
    });

  it("should have consistent metadata structure", () => {
    const requiredFields = ["title", "thumbnail", "duration", "uploader", "formats"];

    for (const field of requiredFields) {
      expect(sampleMetadata).toHaveProperty(field);
    }

    expect(Array.isArray(sampleMetadata.formats)).toBe(true);
    expect(sampleMetadata.formats.length).toBeGreaterThan(0);
  });
});
