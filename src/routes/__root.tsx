import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "YT-DLP Web Wrapper",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              404
            </h1>
            <p className="text-xl font-semibold text-muted-foreground">
              Page Not Found
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The YT-DLP downloader is here, but this page isn't. Let's get you
            back to extracting media.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50"></div>
          <div className="relative">
            <Toaster
              position="top-center"
              richColors
              className="backdrop-blur-sm"
            />
            {children}
          </div>
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </div>
      </body>
    </html>
  );
}
