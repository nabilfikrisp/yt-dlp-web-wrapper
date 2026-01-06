import * as z from "zod";

export const youtubeRegex =
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})(\S+)?$/;

export const youtubeInputURLSchema = z.object({
  url: z
    .url("Please enter a valid URL")
    .regex(youtubeRegex, "That doesn't look like a valid YouTube video link"),
});
