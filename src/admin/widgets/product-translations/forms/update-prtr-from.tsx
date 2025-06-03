import {
  Label,
  Input,
  Container,
  toast,
  Drawer,
  Button,
  Select,
} from "@medusajs/ui";
import { QueryObserverResult } from "@tanstack/react-query";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as zod from "zod";
import { productTranslationSchema } from "../../../../api/admin/product-translations/validators";
import { sdk } from "../../../lib/sdk";
import { Translation } from "../product-translations-widget";
import { useEffect } from "react";

export const UpdateProjectTranslationForm = ({
  initialTranslation,
  isOpen,
  onOpenChange,
  refetch,
}: {
  initialTranslation: Translation;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => Promise<QueryObserverResult<Translation[], Error>>;
}) => {
  const form = useForm<zod.infer<typeof productTranslationSchema>>({
    defaultValues: {
      language_code: initialTranslation.language_code,
      title: initialTranslation.title,
      sub_title: initialTranslation.sub_title,
      description: initialTranslation.description,
    },
  });

  useEffect(() => {
    form.reset({
      language_code: initialTranslation.language_code,
      title: initialTranslation.title,
      sub_title: initialTranslation.sub_title,
      description: initialTranslation.description,
    });
  }, [initialTranslation, form]);

  const languageOpts = [
    { label: "Arabic", value: "AR" },
    { label: "Russian", value: "RU" },
  ];

  const handleSubmit = form.handleSubmit((translation) => {
    sdk.client
      .fetch(`/admin/product-translations/${initialTranslation.id}`, {
        method: "POST",
        body: {
          translation: translation,
        },
      })
      .then(() => {
        toast.success("Translation created");
        onOpenChange?.(false);
        refetch?.();
      })
      .catch(() => {
        toast.error("Failed to create translation");
      });
  });

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header />
        <Drawer.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <h1 className="capitalize font-medium font-core py-4">
                  Create Translation
                </h1>
                <Container className="flex w-full flex-1 flex-col gap-y-8 overflow-y-auto shadow-none px-0">
                  <Controller
                    control={form.control}
                    name="language_code"
                    render={({ field }) => {
                      return (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select a language" />
                          </Select.Trigger>
                          <Select.Content>
                            {languageOpts.map((option) => (
                              <Select.Item
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="title"
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              Title
                            </Label>
                          </div>
                          <Input {...field} />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="sub_title"
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              Subtitle
                            </Label>
                          </div>
                          <Input {...field} value={field.value || ""} />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="description"
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              Description
                            </Label>
                          </div>
                          <Input {...field} />
                        </div>
                      );
                    }}
                  />
                </Container>
                <Button type="submit">Update</Button>
              </form>
            </FormProvider>
          </div>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
};
