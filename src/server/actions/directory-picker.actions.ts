import { createServerFn } from "@tanstack/react-start";
import type { ServerResponse } from "@/shared/types/api.types";
import { openDirectoryDialog } from "../services/directory-picker.service";
import { logger } from "../utils/logger";

export const getNativeDirectoryAction = createServerFn({
  method: "GET",
}).handler(async (): Promise<ServerResponse<string>> => {
  logger.info("Native directory action triggered");
  return await openDirectoryDialog();
});
