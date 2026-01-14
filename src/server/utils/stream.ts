import { ERROR_MESSAGES } from "@/server/services/errors/messages";
import { APP_CONFIG } from "@/shared/config/app.config";
import { logger } from "./logger";

export function formatSSEMessage(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function createStreamTimeout(
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
