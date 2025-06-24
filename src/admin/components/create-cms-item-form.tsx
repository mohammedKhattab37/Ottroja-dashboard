import {
  Label,
  Input,
  Container,
  toast,
  FocusModal,
  Button,
  Divider,
  Select,
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
import ImageCMSModule from "./cms-images-handler";
import { AdminFile } from "@medusajs/framework/types";
import { cmsPositionsList, languagesList, regionsList } from "../lib/constants";

export const CreateCMSItemForm = ({
  refetch,
}: {
  refetch: () => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleFormInputs, setVisibleFormInputs] = useState<string[]>([]);
  const [content, setContent] = useState<Content>("");
  const [images, setImages] = useState<AdminFile[]>();

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
      sub_title: "",
      region: "",
      position: "",
      language: "",
      button_destination: "",
      button_text: "",
    },
  });

  const isFieldVisible = (fieldName: string): boolean => {
    if (visibleFormInputs.length == 0) return true; // Show all fields if no position selected

    return visibleFormInputs?.includes(fieldName) ?? true;
  };

  const handleSubmit = form.handleSubmit((cmsItem) => {
    if (cmsItem.button_text == "" || cmsItem.button_destination == "") {
      cmsItem.button_destination = "";
      cmsItem.button_text = "";
    }

    sdk.client
      .fetch("/admin/cms", {
        method: "POST",
        body: {
          ...cmsItem,
          items: items,
          content: content,
          images: images?.map((i) => i.url + "||" + i.id),
        },
      })
      .then(() => {
        toast.success("CMS item created");
        setIsOpen(false);
        form.reset();
        refetch();
      })
      .catch((e) => {
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
                  <div className="grid grid-cols-5 gap-4">
                    <Controller
                      control={form.control}
                      name="language"
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
                                <Select.Value placeholder="Languages" />
                              </Select.Trigger>
                              <Select.Content className="max-h-fit">
                                {languagesList.map((option) => (
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
                      name="region"
                      render={({ field }) => {
                        return (
                          <div className="flex flex-col space-y-2 col-span-2">
                            <div className="flex items-center gap-x-1">
                              <Label size="small" weight="plus">
                                Country
                              </Label>
                            </div>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Select.Trigger>
                                <Select.Value placeholder="Select a region" />
                              </Select.Trigger>
                              <Select.Content className="max-h-fit">
                                {regionsList.map((option) => (
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
                      name="position"
                      render={({ field }) => {
                        return (
                          <div className="flex flex-col space-y-2 col-span-2">
                            <div className="flex items-center gap-x-1">
                              <Label size="small" weight="plus">
                                Position
                              </Label>
                            </div>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                const selected = cmsPositionsList.find(
                                  (option) => option.value === value
                                );
                                setVisibleFormInputs(selected?.fields || []);
                              }}
                            >
                              <Select.Trigger>
                                <Select.Value placeholder="Select a position" />
                              </Select.Trigger>
                              <Select.Content className="max-h-fit">
                                {cmsPositionsList.map((option) => (
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
                  </div>

                  {isFieldVisible("title") && (
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
                            <Input
                              {...field}
                              value={field.value || undefined}
                            />
                          </div>
                        );
                      }}
                    />
                  )}

                  {isFieldVisible("sub_title") && (
                    <Controller
                      control={form.control}
                      name="sub_title"
                      render={({ field }) => {
                        return (
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-x-1">
                              <Label size="small" weight="plus">
                                Sub Title
                              </Label>
                              <OptionalFormTag />
                            </div>
                            <Input
                              {...field}
                              value={field.value || undefined}
                            />
                          </div>
                        );
                      }}
                    />
                  )}

                  {isFieldVisible("button") && (
                    <div className="grid gap-y-4">
                      <div className="flex items-center gap-x-1">
                        <Label size="small" weight="plus">
                          Button
                        </Label>
                        <OptionalFormTag />
                      </div>
                      <div className="px-5 grid gap-y-2">
                        <Controller
                          control={form.control}
                          name="button_text"
                          render={({ field }) => {
                            return (
                              <div className="flex flex-col space-y-2">
                                <Label size="small" weight="plus">
                                  Text
                                </Label>
                                <Input
                                  {...field}
                                  value={field.value || undefined}
                                />
                              </div>
                            );
                          }}
                        />
                        <Controller
                          control={form.control}
                          name="button_destination"
                          render={({ field }) => {
                            return (
                              <div className="flex flex-col space-y-2">
                                <Label size="small" weight="plus">
                                  Destination
                                </Label>
                                <Input
                                  {...field}
                                  value={field.value || undefined}
                                />
                              </div>
                            );
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {isFieldVisible("content") && (
                    <>
                      <Divider />
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-x-1">
                          <Label size="small" weight="plus">
                            Content
                          </Label>
                          <OptionalFormTag />
                        </div>
                        <RichTextEditor
                          content={content}
                          onChange={setContent}
                        />
                      </div>
                    </>
                  )}

                  {isFieldVisible("items") && (
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
                  )}

                  {isFieldVisible("images") && (
                    <>
                      <Divider />
                      <div className="flex flex-col space-y-4">
                        <div className="flex gap-x-1">
                          <Label size="small" weight="plus">
                            Images
                          </Label>
                          <OptionalFormTag />
                        </div>
                        <ImageCMSModule images={images} setImages={setImages} />
                      </div>
                    </>
                  )}
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
