import { createFileRoute } from "@tanstack/react-router";
import { downloadRequestSchema } from "@/features/downloader/validators/download-request.validator";
import { executeDownloadStream } from "@/server/services/downloader.service";
import { ERROR_MESSAGES } from "@/server/utils/error.utils";
import { logger } from "@/server/utils/logger.utils";
import { APP_CONFIG } from "@/shared/config/app.config";
import type { DownloadRequest } from "@/shared/types/api.types";

function formatSSEMessage(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function createStreamTimeout(
  controller: ReadableStreamDefaultController,
  abortController: AbortController,
  url: string,
): NodeJS.Timeout {
  return setTimeout(() => {
    logger.info("Stream response timed out", { url });
    abortController.abort();
    controller.enqueue(
      formatSSEMessage({
        type: "error",
        error: ERROR_MESSAGES.DOWNLOAD_TIMEOUT,
      }),
    );
    controller.close();
  }, APP_CONFIG.STREAM_TIMEOUT_MS);
}

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
          return new Response(ERROR_MESSAGES.INVALID_REQUEST_BODY, {
            status: 400,
          });
        }

        const validationResult = downloadRequestSchema.safeParse(parsedBody);

        if (!validationResult.success) {
          logger.error(
            "Invalid download request payload",
            validationResult.error,
            { url: request.url },
          );
          return new Response(ERROR_MESSAGES.INVALID_DOWNLOAD_REQUEST, {
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
            timeoutId = createStreamTimeout(
              controller,
              abortController,
              request.url,
            );

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
                clearTimeout(timeoutId);
                timeoutId = createStreamTimeout(
                  controller,
                  abortController,
                  request.url,
                );
                controller.enqueue(formatSSEMessage(update));
              }
            } catch (error) {
              logger.error("Error during download stream in API route", error, {
                url: downloadRequest.url,
              });
              controller.enqueue(
                formatSSEMessage({
                  type: "error",
                  error:
                    error instanceof Error
                      ? error.message
                      : ERROR_MESSAGES.UNKNOWN_ERROR,
                }),
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
