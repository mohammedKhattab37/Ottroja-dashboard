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
import { categoryTranslationSchema } from "../../../../api/admin/category-translations/validators";
import { sdk } from "../../../lib/sdk";
import { Translation } from "../category-translations-widget";
import { useEffect } from "react";

export const UpdateCategoryTranslationForm = ({
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
  const form = useForm<zod.infer<typeof categoryTranslationSchema>>({
    defaultValues: {
      language_code: initialTranslation.language_code,
      name: initialTranslation.name,
      description: initialTranslation.description,
    },
  });

  useEffect(() => {
    form.reset({
      language_code: initialTranslation.language_code,
      name: initialTranslation.name,
      description: initialTranslation.description,
    });
  }, [initialTranslation, form]);

  const languageOpts = [
    { label: "Arabic", value: "AR" },
    { label: "Russian", value: "RU" },
  ];

  const handleSubmit = form.handleSubmit((translation) => {
    sdk.client
      .fetch(`/admin/category-translations/${initialTranslation.id}`, {
        method: "POST",
        body: translation,
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
        <Drawer.Header>
          <Drawer.Title className="font-sans font-medium h1-core">
            Edit Translation
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col items-center">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <Container className="flex w-full flex-1 flex-col gap-y-8 overflow-y-auto shadow-none px-0">
                  <Controller
                    control={form.control}
                    name="language_code"
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              Language
                            </Label>
                          </div>
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
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="name"
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              Name
                            </Label>
                          </div>
                          <Input {...field} />
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
