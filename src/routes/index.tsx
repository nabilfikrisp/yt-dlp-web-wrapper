import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { youtubeInputURLSchema } from "@/flows/input-yt-url/form-schema";
import { getYTVersion, processURL } from "@/flows/input-yt-url/server-action";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const [version, setVersion] = useState<string>("Checking...");

  const checkVersion = async () => {
    console.log("Checking yt-dlp version...");
    try {
      const res = await getYTVersion();
      setVersion(res.version);
      console.log(res);
    } catch (err) {
      setVersion("Not Found");
    }
  };

  const form = useForm({
    defaultValues: {
      url: "",
    },
    validators: {
      onSubmit: youtubeInputURLSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Validating URL...");

      try {
        const result = await processURL({ data: value });
        console.log(result);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, {
            id: toastId,
            description: "Please check your YouTube link and try again.",
          });
          return;
        }

        toast.error("Something went wrong", {
          id: toastId,
          description: "Please check your YouTube link and try again.",
        });
      }
    },
  });

  const formId = useId();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="w-full flex-1 max-w-4xl mx-auto px-5 py-10 flex flex-col justify-center items-center">
        {/* FORM CARD */}
        <Card className="w-full sm:max-w-md mx-auto ">
          <CardHeader>
            <CardTitle>YT DLP Web Wrapper</CardTitle>
            <CardDescription>
              Paste a YouTube video link to download it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id={formId}
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field
                  name="url"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Youtube Video URL
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="https://www.youtube.com/watch?v=dQ....."
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal">
              <Button type="button" variant="outline" onClick={checkVersion}>
                Check Version
              </Button>
              <Button type="submit" form={formId}>
                Submit
              </Button>
            </Field>
          </CardFooter>
        </Card>

        {/* INFO CARD */}
      </div>
    </div>
  );
}
