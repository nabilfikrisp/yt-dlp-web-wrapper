import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Info, Loader2, XIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MetadataDisplay } from "@/flows/input-yt-url/component/meta-data-display.ui";
import { youtubeInputURLSchema } from "@/flows/input-yt-url/form-schema";
import {
  getVideoMetadata,
  getYTVersion,
} from "@/flows/input-yt-url/server-action";
import type { VideoMetadata } from "@/flows/input-yt-url/server-utils";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    const res = await getYTVersion();
    return {
      version: res.success ? res.data : null,
    };
  },
});

function App() {
  const { version } = Route.useLoaderData();
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  const [error, setError] = useState<string | null>(null);

  const formId = useId();

  const form = useForm({
    defaultValues: { url: "" },

    validators: { onSubmit: youtubeInputURLSchema },
    onSubmit: async ({ value }) => {
      const res = await getVideoMetadata({ data: value });

      if (!res.success) {
        setError(res.error);
        return;
      }

      setMetadata(res.data);
      setVideoUrl(value.url);
    },
  });
  function reset() {
    setMetadata(null);
    setError(null);
    form.reset();
  }

  return (
    <div
      className={`min-h-dvh w-full flex flex-col items-center bg-background px-6 transition-all duration-500 ease-in-out ${metadata ? "py-12" : "justify-center"}`}
    >
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {/* Header - Simple and fades when metadata is present */}
        {!metadata && (
          <div className="text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-4xl font-extrabold tracking-tight italic">
              YT-DLP
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Web Extractor
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <form
              id={formId}
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <form.Field
                name="url"
                children={(field) => (
                  <Field>
                    <div className="relative">
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Paste YouTube link..."
                        className="h-14 pl-6 pr-32 rounded-2xl border-2 transition-all focus-visible:ring-primary/20"
                      />
                      <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-1">
                        {metadata && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={reset}
                            className="h-full rounded-xl px-3"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        )}
                        <form.Subscribe
                          selector={(state) => [
                            state.canSubmit,
                            state.isSubmitting,
                          ]}
                          children={([canSubmit, isSubmitting]) => (
                            <Button
                              size="lg"
                              disabled={!canSubmit || isSubmitting}
                              className="h-full rounded-xl px-6 transition-all active:scale-95"
                            >
                              {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <ArrowRight className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        />
                      </div>
                    </div>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <div className="flex items-center gap-2 text-destructive mt-2 px-2 animate-in slide-in-from-top-1">
                          <Info className="w-3 h-3" />
                          <FieldError
                            className="text-xs font-medium"
                            errors={field.state.meta.errors}
                          />
                        </div>
                      )}
                  </Field>
                )}
              />
            </form>
          </div>

          {/* ERROR BANNER */}
          <form.Subscribe
            selector={(s) => [s.isSubmitting]}
            children={([isSubmitting]) => (
              <>
                {error && !isSubmitting && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/3 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    <div className="mt-0.5 bg-destructive/10 p-1.5 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-destructive" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black text-destructive/50 uppercase tracking-[0.2em]">
                        Server Response
                      </p>
                      <p className="text-sm font-semibold text-destructive/90 leading-relaxed">
                        {error}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setError(null)}
                      className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                    >
                      <XIcon className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </>
            )}
          />
        </div>

        {/* Result View */}
        {metadata && <MetadataDisplay data={metadata} videoUrl={videoUrl} />}

        {/* Minimal Footer */}
        {!metadata && (
          <p className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
            v{version} • stable engine
          </p>
        )}
      </div>
    </div>
  );
}
