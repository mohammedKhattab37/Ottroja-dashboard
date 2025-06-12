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

export const CreateCMSItemForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");

  const emptyItem = {
    title: undefined,
    url: undefined,
  };
  const [items, setItems] = useState<
    {
      title: string | undefined;
      url: string | undefined;
    }[]
  >([emptyItem]);
  const form = useForm<zod.infer<typeof cmsItemSchema>>({
    defaultValues: {
      name: "",
      title: "",
      content: "",
    },
  });
  const handleSubmit = form.handleSubmit((cmsItem) => {
    sdk.client
      .fetch("/admin/cms", {
        method: "POST",
        body: { ...cmsItem, items: items.filter((it) => it.title || it.url) },
      })
      .then(() => {
        toast.success("CMS item created");
        setIsOpen(false);
        form.reset();
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
                  Create CMS Item
                </h1>
                <Container className="flex w-full flex-1 flex-col gap-y-8 overflow-y-auto shadow-none px-0">
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
                          </div>
                          <Input {...field} value={field.value || undefined} />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="content"
                    render={({ field }) => {
                      return (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              Content
                            </Label>
                          </div>
                          <RichTextEditor
                            content={content}
                            onChange={setContent}
                          />
                        </div>
                      );
                    }}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <Label size="small" weight="plus">
                        Items
                      </Label>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setItems([...items, emptyItem])}
                      >
                        Add
                      </Button>
                    </div>
                    <Divider className="my-2" />
                    {items.map((item, index) => (
                      <CMSItemsList
                        key={index}
                        item={item}
                        index={index}
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

type CMSItemsProps = {
  item: {
    title: string | undefined;
    url: string | undefined;
  };
  index: number;
  setItems: React.Dispatch<
    React.SetStateAction<
      {
        title: string | undefined;
        url: string | undefined;
      }[]
    >
  >;
};

const CMSItemsList = ({ item, index, setItems }: CMSItemsProps) => (
  <div className="grid gap-y-2 px-4 py-2">
    <div>
      <Label size="small" weight="plus">
        Title
      </Label>
      <Input
        type="text"
        placeholder="Title"
        className="w-full mt-1 rounded-md p-2"
        value={item.title}
        onChange={(e) =>
          setItems((items) =>
            items.map((item, i) => {
              return i === index
                ? {
                    ...item,
                    title: e.target.value,
                  }
                : item;
            })
          )
        }
      />
    </div>
    <div className="flex items-end justify-between">
      <div className="w-[75%]">
        <Label size="small" weight="plus">
          URL
        </Label>
        <Input
          type="text"
          placeholder="Url"
          className="w- mt-1 rounded-md p-2"
          value={item.url}
          onChange={(e) =>
            setItems((items) =>
              items.map((item, i) => {
                return i === index
                  ? {
                      ...item,
                      url: e.target.value,
                    }
                  : item;
              })
            )
          }
        />
      </div>
      <Button
        variant="danger"
        type="button"
        className="w-fit h-fit"
        onClick={() => setItems((items) => items.filter((_, i) => i !== index))}
      >
        Remove
      </Button>
    </div>
  </div>
);
