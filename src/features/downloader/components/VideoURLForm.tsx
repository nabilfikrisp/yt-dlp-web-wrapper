import { useForm } from "@tanstack/react-form";
import { ArrowRight, Info, Loader2, XIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { youtubeInputURLSchema } from "../validators/video-url.validator";

interface DownloaderFormProps {
  showReset: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (url: string) => Promise<void>;
  onReset: () => void;
  onDismissError: () => void;
}

export function DownloaderForm({
  showReset,
  isSubmitting,
  error,
  onSubmit,
  onReset,
  onDismissError,
}: DownloaderFormProps) {
  const formId = useId();

  const form = useForm({
    defaultValues: { url: "" },

    validators: { onSubmit: youtubeInputURLSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value.url);
      form.reset();
    },
  });

  return (
    <div className="flex flex-col gap-4">
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
                <div className="relative shadow-xl shadow-primary/10 group-hover:shadow-primary/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Paste a YouTube link to extract..."
                    className="h-16 pl-7 pr-32 rounded-2xl border-2 transition-all duration-300 focus-visible:ring-primary/30 focus-visible:shadow-2xl shadow-primary/10 text-base placeholder:text-muted-foreground/50 bg-background/80 backdrop-blur-sm relative"
                  />
                  <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-1">
                    {showReset && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onReset}
                        className="h-full rounded-xl px-4 hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    )}
                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                      children={([canSubmit, submitting]) => (
                        <Button
                          size="lg"
                          type="submit"
                          disabled={!canSubmit || submitting || isSubmitting}
                          className="h-full aspect-square rounded-xl transition-all duration-200 active:scale-[0.96] font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 bg-primary hover:bg-primary/90"
                        >
                          {submitting || isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                          )}
                        </Button>
                      )}
                    />
                  </div>
                </div>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <div className="flex items-center gap-2 text-destructive mt-2.5 px-3 animate-in slide-in-from-top-1">
                      <div className="bg-destructive/10 p-1 rounded-lg">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <FieldError
                        className="text-xs font-semibold"
                        errors={field.state.meta.errors}
                      />
                    </div>
                  )}
              </Field>
            )}
          />
        </form>
      </div>

      {error && !isSubmitting && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-linear-to-r from-destructive/5 to-destructive/10 border border-destructive/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-1">
          <div className="mt-0.5 bg-destructive/15 p-1.5 rounded-lg border border-destructive/20">
            <Info className="w-3.5 h-3.5 text-destructive" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-black text-destructive/70 uppercase tracking-wider">
              Connection Error
            </p>
            <p className="text-sm font-semibold text-destructive leading-relaxed">
              {error}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismissError}
            className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
