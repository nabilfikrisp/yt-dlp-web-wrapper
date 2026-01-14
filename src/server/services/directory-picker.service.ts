import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { ServerResponse } from "@/shared/types/api.types";
import { logger } from "../utils/logger";
import { ERROR_MESSAGES } from "./errors/messages";

const execAsync = promisify(exec);

export async function openDirectoryDialog(): Promise<ServerResponse<string>> {
  logger.info("Opening directory dialog");

  let command = "";
  const timeoutMs = 30000;

  if (process.platform === "win32") {
    command =
      "powershell -ExecutionPolicy Bypass -Command \"Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; if($f.ShowDialog() -eq 'OK') { $f.SelectedPath }\"";
  } else if (process.platform === "darwin") {
    command =
      "osascript -e 'POSIX path of (choose folder with prompt \"Select Download Folder\")'";
  } else if (process.platform === "linux") {
    command = "zenity --file-selection --directory";
  } else {
    logger.error("Unsupported platform", { platform: process.platform });
    return {
      success: false,
      data: null,
      error: ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED,
    };
  }

  try {
    logger.info("Executing dialog command", { platform: process.platform });

    const { stdout } = await execAsync(command, { timeout: timeoutMs });
    const selectedPath = stdout.trim();

    if (!selectedPath) {
      logger.info("Dialog cancelled by user (empty result)");
      return {
        success: false,
        data: null,
        error: ERROR_MESSAGES.DIALOG_CANCELLED,
      };
    }

    const normalizedPath = path.normalize(selectedPath);

    logger.info("Directory selected", { path: normalizedPath });

    return {
      success: true,
      data: normalizedPath,
      error: null,
    };
  } catch (error) {
    const execError = error as {
      message?: string;
      stderr?: string;
      killed?: boolean;
    };
    const isCancel =
      execError.message?.includes("cancel") ||
      execError.stderr?.includes("cancel") ||
      execError.killed;

    if (isCancel) {
      logger.info("Dialog cancelled by user (exception)");
      return {
        success: false,
        data: null,
        error: ERROR_MESSAGES.DIALOG_CANCELLED,
      };
    }

    if (execError.stderr?.includes("command not found")) {
      logger.error("Required command not found");
      return {
        success: false,
        data: null,
        error: ERROR_MESSAGES.COMMAND_NOT_FOUND,
      };
    }

    logger.error("Dialog execution failed", { error });
    return {
      success: false,
      data: null,
      error: execError.message || ERROR_MESSAGES.DIALOG_FAILED,
    };
  }
}
