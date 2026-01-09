export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "info", msg, ...meta }));
  },
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: "error", msg, error: err, ...meta }));
  },
};
