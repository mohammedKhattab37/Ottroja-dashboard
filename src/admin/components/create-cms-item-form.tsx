import {
  Label,
  Input,
  Container,
  toast,
  FocusModal,
  Button,
  Divider,
} from "@medusajs/ui";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "./../lib/sdk";
import { useState } from "react";
import { cmsItemSchema } from "../../api/admin/cms/validators";
import { RichTextEditor } from "./richtext-editor";
import { Content } from "@tiptap/core";
import OptionalFormTag from "./optional-form-tag";
import { CMSFormItemsList } from "./cms-form-items-list";

export const CreateCMSItemForm = ({
  refetch,
}: {
  refetch: () => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [engContent, setEngContent] = useState<Content>("");
  const [arContent, setArContent] = useState<Content>("");

  const [items, setItems] = useState<{
    [key: string]: {
      title: string;
      url?: string;
    };
  }>({});
  const form = useForm<zod.infer<typeof cmsItemSchema>>({
    defaultValues: {
      name: "",
      title: "",
    },
  });
  const handleSubmit = form.handleSubmit((cmsItem) => {
    sdk.client
      .fetch("/admin/cms", {
        method: "POST",
        body: {
          ...cmsItem,
          items: items,
          eng_content: engContent,
          ar_content: arContent,
        },
      })
      .then(() => {
        toast.success("CMS item created");
        setIsOpen(false);
        form.reset();
        refetch();
      })
      .catch(() => {
        toast.error("Failed to create CMS item");
      });
  });

  return (
    <FocusModal open={isOpen} onOpenChange={setIsOpen}>
      <FocusModal.Trigger asChild>
        <Button variant="secondary" className="py-1 px-2">
          Create
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content className="overflow-y-scroll">
        <FocusModal.Header />
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-[35rem] flex-col gap-y-8">
            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <h1 className="capitalize font-medium font-core py-4">
                  Create CMS Item
                </h1>
                <Container className="flex w-full flex-1 flex-col gap-y-8 shadow-none px-0">
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
                    name="title"
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              Title
                            </Label>
                            <OptionalFormTag />
                          </div>
                          <Input {...field} value={field.value || undefined} />
                        </div>
                      );
                    }}
                  />

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-x-1">
                      <Label size="small" weight="plus">
                        English Content
                      </Label>
                      <OptionalFormTag />
                    </div>
                    <RichTextEditor
                      content={engContent}
                      onChange={setEngContent}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-x-1">
                      <Label size="small" weight="plus">
                        Arabic Content
                      </Label>
                      <OptionalFormTag />
                    </div>
                    <RichTextEditor
                      content={arContent}
                      onChange={setArContent}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-x-1">
                        <Label size="small" weight="plus">
                          Items
                        </Label>
                        <OptionalFormTag />
                      </div>

                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => {
                          const newKey = Object.keys(items).length.toString();
                          setItems({
                            ...items,
                            [newKey]: {
                              title: "",
                              url: undefined,
                            },
                          });
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <Divider className="my-2" />
                    {Object.values(items).map((item, i) => (
                      <CMSFormItemsList
                        key={i}
                        item={item}
                        index={i}
                        setItems={setItems}
                      />
                    ))}
                  </div>
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
