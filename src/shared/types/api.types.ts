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

export type StreamProgress = {
  type: "progress";
  data: number;
  raw: string;
  error: null;
};

export type StreamSuccess = {
  type: "success";
  data: string;
  raw: string;
  error: null;
};

export type StreamError = {
  type: "error";
  data: null;
  raw: string;
  error: string;
};

export type StreamIdle = {
  type: "idle";
  data: null;
  raw: string;
  error: null;
};
