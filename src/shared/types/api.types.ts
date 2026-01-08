export interface ServerResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface DownloadRequest {
  url: string;
  videoFormatId: string | null;
  audioFormatId: string | null;
  subId: string | null;
}

export interface VideoMetadataRequest {
  url: string;
}
