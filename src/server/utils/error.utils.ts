export function handleServerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`[Terminal] 🚨 Error: ${message}`);

  return {
    success: false,
    data: null,
    error: message || "An unexpected server error occurred",
  };
}
