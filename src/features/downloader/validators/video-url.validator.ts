import * as z from "zod";
import { YOUTUBE_REGEX } from "@/shared/constants/youtube.constants";

export const youtubeInputURLSchema = z.object({
  url: z
    .url("Please enter a valid URL")
    .regex(YOUTUBE_REGEX, "That doesn't look like a valid YouTube video link"),
});

export type YoutubeInputURL = z.infer<typeof youtubeInputURLSchema>;
