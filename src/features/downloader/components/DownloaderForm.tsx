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
                <div className="relative shadow-lg">
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Paste a YouTube link to extract..."
                    className="h-16 pl-7 pr-32 rounded-2xl border-2 transition-all focus-visible:ring-primary/20 focus-visible:shadow-xl shadow-primary/5 text-base placeholder:text-muted-foreground/50"
                  />
                  <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-1">
                    {showReset && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onReset}
                        className="h-full rounded-xl px-4 hover:bg-accent/50"
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
                          className="h-full rounded-xl px-7 transition-all active:scale-95 font-semibold"
                        >
                          {submitting || isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-5 h-5" />
                          )}
                        </Button>
                      )}
                    />
                  </div>
                </div>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <div className="flex items-center gap-2 text-destructive mt-2.5 px-3 animate-in slide-in-from-top-1">
                      <Info className="w-4 h-4" />
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
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-destructive/5 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
          <div className="mt-0.5 bg-destructive/10 p-1.5 rounded-lg">
            <Info className="w-3.5 h-3.5 text-destructive" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-black text-destructive/60 uppercase tracking-wider">
              Server Error
            </p>
            <p className="text-sm font-semibold text-destructive leading-relaxed">
              {error}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismissError}
            className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
