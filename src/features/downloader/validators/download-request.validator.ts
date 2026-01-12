import * as z from "zod";

export const downloadRequestSchema = z.object({
  url: z.string(),
  videoFormatId: z.string().nullable(),
  audioFormatId: z.string().nullable(),
  subId: z.string().nullable(),
  downloadPath: z.string().optional(),
  displayData: z.object({
    title: z.string(),
    thumbnail: z.string(),
  }),
});
