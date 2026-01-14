export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function createAppError(
  message: string,
  code: string,
  statusCode: number = 500,
): AppError {
  return new AppError(message, code, statusCode);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
