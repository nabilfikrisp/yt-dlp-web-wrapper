import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stream-download")({
  server: {
    handlers: {
      GET: () => {
        return new Response(null, {
          status: 200,
          statusText: "OK",
        });
      },
      POST: () => {
        return new Response(null, {
          status: 200,
          statusText: "OK",
        });
      },
    },
  },
});
