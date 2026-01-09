import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";
import { executeDownloadStream } from "@/server/services/downloader.service";
import { logger } from "@/server/utils/logger.utils";
import { APP_CONFIG } from "@/shared/config/app.config";
import type { DownloadRequest } from "@/shared/types/api.types";

const downloadSchema = z.object({
  url: z.string(),
  videoFormatId: z.string().nullable(),
  audioFormatId: z.string().nullable(),
  subId: z.string().nullable(),
});

export const Route = createFileRoute("/api/stream-download")({
  server: {
    handlers: {
      async POST({ request }) {
        const abortController = new AbortController();
        const signal = abortController.signal;

        request.signal.addEventListener("abort", () => {
          logger.info("Client disconnected, aborting download stream", {
            url: request.url,
          });
          abortController.abort();
        });

        let parsedBody: DownloadRequest;
        try {
          parsedBody = await request.json();
        } catch (error) {
          logger.error("Failed to parse request body", error, {
            url: request.url,
          });
          return new Response("Invalid request body", { status: 400 });
        }

        const validationResult = downloadSchema.safeParse(parsedBody);

        if (!validationResult.success) {
          logger.error(
            "Invalid download request payload",
            validationResult.error,
            { url: request.url },
          );
          return new Response("Invalid download request payload", {
            status: 400,
          });
        }

        const downloadRequest = validationResult.data;

        const headers = {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        };

        let timeoutId: NodeJS.Timeout;
        const responseStream = new ReadableStream({
          async start(controller) {
            timeoutId = setTimeout(() => {
              logger.info("Stream response timed out", { url: request.url });
              abortController.abort();
              controller.enqueue(
                `data: ${JSON.stringify({ type: "error", error: "Download timeout. Please try again." })}\n\n`,
              );
              controller.close();
            }, APP_CONFIG.STREAM_TIMEOUT_MS);

            logger.info("Starting download stream for new API route", {
              url: downloadRequest.url,
            });

            try {
              for await (const update of executeDownloadStream(
                downloadRequest,
                signal,
              )) {
                if (signal.aborted) {
                  logger.info("Stream aborted during iteration", {
                    url: downloadRequest.url,
                  });
                  break;
                }
                controller.enqueue(`data: ${JSON.stringify(update)}\n\n`);
              }
            } catch (error) {
              logger.error("Error during download stream in API route", error, {
                url: downloadRequest.url,
              });
              controller.enqueue(
                `data: ${JSON.stringify({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })}\n\n`,
              );
            } finally {
              clearTimeout(timeoutId);
              controller.close();
              logger.info("Download stream finished for new API route", {
                url: downloadRequest.url,
              });
            }
          },
        });

        return new Response(responseStream, { headers });
      },
    },
  },
});
