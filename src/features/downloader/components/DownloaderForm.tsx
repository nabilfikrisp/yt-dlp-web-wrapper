import { useForm } from "@tanstack/react-form";
import { ArrowRight, Info, Loader2, XIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getVideoMetadataAction } from "@/server/actions/downloader.actions";
import type { VideoMetadata } from "../types/video-metadata.types";
import { youtubeInputURLSchema } from "../validators/video-url.validator";
import { MetadataDisplay } from "./MetadataDisplay";

interface DownloaderFormProps {
  metadata: VideoMetadata | null;
  setMetadata: (metadata: VideoMetadata | null) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  reset: () => void;
}

export function DownloaderForm({
  metadata,
  setMetadata,
  videoUrl,
  setVideoUrl,
  error,
  setError,
  reset,
}: DownloaderFormProps) {
  const formId = useId();

  const form = useForm({
    defaultValues: { url: "" },

    validators: { onSubmit: youtubeInputURLSchema },
    onSubmit: async ({ value }) => {
      const res = await getVideoMetadataAction({ data: value });

      if (!res.success) {
        setError(res.error);
        return;
      }

      setMetadata(res.data);
      setVideoUrl(value.url);
    },
  });

  return (
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

      {metadata && <MetadataDisplay data={metadata} videoUrl={videoUrl} />}
    </div>
  );
}
