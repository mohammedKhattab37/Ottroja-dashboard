import {
  Label,
  Input,
  Container,
  toast,
  Drawer,
  Button,
  Divider,
} from "@medusajs/ui";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as zod from "zod";
import { useState } from "react";
import { sdk } from "../lib/sdk";
import { cmsItemSchema } from "../../api/admin/cms/validators";
import { Content } from "@tiptap/core";
import { RichTextEditor } from "./richtext-editor";
import OptionalFormTag from "./optional-form-tag";
import { CMSFormItemsList } from "./cms-form-items-list";
import { CMSItem } from "../routes/cms/[itemId]/page";
import { AdminFile } from "@medusajs/framework/types";
import ImageCMSModule from "./cms-images-handler";

export const UpdateCMSItemForm = ({
  initialItemData,
  isOpen,
  onOpenChange,
  refetch,
}: {
  initialItemData: CMSItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => Promise<void>;
}) => {
  const [engContent, setEngContent] = useState<Content>(
    initialItemData.eng_content
  );
  const [arContent, setArContent] = useState<Content>(
    initialItemData.ar_content
  );
  const [items, setItems] = useState(initialItemData.items);
  const [images, setImages] = useState<AdminFile[] | undefined>(
    initialItemData.images.map((imageStr) => {
      const imageSplit = imageStr.split("||");
      return { id: imageSplit[1], url: imageSplit[0] };
    })
  );

  const form = useForm<zod.infer<typeof cmsItemSchema>>({
    defaultValues: {
      name: initialItemData.name,
      title: initialItemData.title || "",
    },
  });

  const handleSubmit = form.handleSubmit((item) => {
    console.log(images);
    sdk.client
      .fetch(`/admin/cms/${initialItemData.id}`, {
        method: "POST",
        body: {
          ...item,
          items: items,
          eng_content: engContent,
          ar_content: arContent,
          images: images?.map((i) => i.url + "||" + i.id),
        },
      })
      .then(() => {
        toast.success("CMS Item created");
        onOpenChange?.(false);
        form.reset();
        refetch?.();
      })
      .catch(() => {
        toast.error("Failed to create CMS Item");
      });
  });

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title className="font-sans font-medium h1-core">
            Edit CMS Item
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col items-center overflow-y-scroll">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col overflow-hidden"
              >
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
                          <Input {...field} value={field.value || ""} />
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

                  <div className="flex flex-col space-y-4">
                    <div className="flex gap-x-1">
                      <Label size="small" weight="plus">
                        Images
                      </Label>
                      <OptionalFormTag />
                    </div>
                    <ImageCMSModule images={images} setImages={setImages} />
                  </div>
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
