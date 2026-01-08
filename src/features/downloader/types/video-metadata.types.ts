export interface VideoFormat {
  formatId: string;
  resolution: string;
  ext: string;
  filesize?: number;
}

export interface AudioFormat {
  formatId: string;
  resolution: string;
  ext: string;
  filesize?: number;
}

export interface Subtitle {
  id: string;
  isAuto: boolean;
}

export interface VideoMetadata {
  title: string;
  thumbnail: string;
  duration?: number;
  channel?: string;
  subtitles: Subtitle[];
  videoFormats: VideoFormat[];
  audioFormats: AudioFormat[];
}
