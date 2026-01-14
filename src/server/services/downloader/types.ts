export interface YtDlpFormat {
  format_id: string;
  vcodec: string;
  acodec: string;
  resolution?: string;
  format_note?: string;
  ext: string;
  filesize?: number;
  filesize_approx?: number;
}

export interface YtDlpRawJson {
  title?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  subtitles?: Record<string, unknown>;
  automatic_captions?: Record<string, unknown>;
  formats?: YtDlpFormat[];
}

export interface DownloadPrepared {
  args: string[];
  storagePath: string;
  filename: string;
}
