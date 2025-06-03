import {
  Label,
  Input,
  Container,
  toast,
  FocusModal,
  Button,
  Select,
} from "@medusajs/ui";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as zod from "zod";
import { productTranslationSchema } from "../../../../api/admin/product-translations/validators";
import { sdk } from "../../../lib/sdk";
import { useState } from "react";
import { Translation } from "../product-translations-widget";
import { QueryObserverResult } from "@tanstack/react-query";

export const CreateProjectTranslationForm = ({
  productId,
  refetch,
}: {
  productId: string;
  refetch: () => Promise<QueryObserverResult<Translation[], Error>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<zod.infer<typeof productTranslationSchema>>({
    defaultValues: {
      language_code: "",
      title: "",
      description: "",
    },
  });

  const languageOpts = [
    { label: "English", value: "EN" },
    { label: "Arabic", value: "AR" },
    { label: "Russian", value: "RU" },
    { label: "French", value: "FR" },
    { label: "German", value: "DE" },
    { label: "Spanish", value: "ES" },
  ];

  const handleSubmit = form.handleSubmit((translation) => {
    sdk.client
      .fetch("/admin/product-translations", {
        method: "POST",
        body: {
          translation: { product_id: productId, ...translation },
        },
      })
      .then(() => {
        toast.success("Translation created");
        setIsOpen(false);
        refetch();
      })
      .catch(() => {
        toast.error("Failed to create translation");
      });
  });

  return (
    <FocusModal open={isOpen} onOpenChange={setIsOpen}>
      <FocusModal.Trigger asChild>
        <Button variant="secondary" className="py-1 px-2">
          Create
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header />
        <FocusModal.Body className="flex flex-col items-center py-16">
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
                <Button type="submit">Create</Button>
              </form>
            </FormProvider>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  );
};
