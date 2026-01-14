import * as z from "zod";

export const downloadRequestSchema = z.object({
  url: z.string(),
  videoFormatId: z.string().nullable(),
  videoLabel: z.string().nullable(),
  audioFormatId: z.string().nullable(),
  audioLabel: z.string().nullable(),
  subId: z.string().nullable(),
  downloadPath: z.string().optional(),
  displayData: z.object({
    title: z.string(),
    thumbnail: z.string(),
  }),
});

export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
export type DownloadRequestWithSession = DownloadRequest & {
  isolatedSessionFolder: string;
  sessionIdentity: string;
};
