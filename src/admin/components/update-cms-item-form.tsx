import {
    Label,
    Input,
    Container,
    toast,
    Drawer,
    Button,
    Divider,
    Select,
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
import {
    languagesList,
    regionsList,
    cmsPositionsList,
    pageTypesList,
} from "../lib/constants";

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
    const [visibleFormInputs, setVisibleFormInputs] = useState<string[]>(
        cmsPositionsList.find(
            (option) => option.value === initialItemData.position
        )?.fields || []
    );
    const [selectedPosition, setSelectedPosition] = useState<string>(
        initialItemData.position || ""
    );
    const [content, setContent] = useState<Content>(initialItemData.content);
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
            sub_title: initialItemData.sub_title || "",
            position: initialItemData.position || "",
            language: initialItemData.language || "",
            region: initialItemData.region || "",
            page_type: initialItemData.page_type || "",
            button_destination: initialItemData.button_destination || "",
            button_text: initialItemData.button_text || "",
        },
    });

    const isFieldVisible = (fieldName: string): boolean => {
        if (visibleFormInputs.length == 0) return true; // Show all fields if no position selected

        return visibleFormInputs?.includes(fieldName) ?? true;
    };

    const handleSubmit = form.handleSubmit((item) => {
        if (item.button_text == "" || item.button_destination == "") {
            item.button_destination = "";
            item.button_text = "";
        }

        // Clear page_type if position is not PAGE
        if (item.position !== "PAGE") {
            item.page_type = undefined;
        }

        sdk.client
            .fetch(`/admin/cms/${initialItemData.id}`, {
                method: "POST",
                body: {
                    ...item,
                    items: items,
                    content: content,
                    images: images?.map((i) => i.url + "||" + i.id),
                },
            })
            .then(() => {
                toast.success("CMS Item updated");
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
                                                        <Label
                                                            size="small"
                                                            weight="plus"
                                                        >
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
                                                            <Label
                                                                size="small"
                                                                weight="plus"
                                                            >
                                                                Language
                                                            </Label>
                                                        </div>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <Select.Trigger>
                                                                <Select.Value placeholder="Languages" />
                                                            </Select.Trigger>
                                                            <Select.Content className="max-h-fit">
                                                                {languagesList.map(
                                                                    (
                                                                        option
                                                                    ) => (
                                                                        <Select.Item
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </Select.Item>
                                                                    )
                                                                )}
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
                                                            <Label
                                                                size="small"
                                                                weight="plus"
                                                            >
                                                                Country
                                                            </Label>
                                                        </div>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <Select.Trigger>
                                                                <Select.Value placeholder="Select a region" />
                                                            </Select.Trigger>
                                                            <Select.Content className="max-h-fit">
                                                                {regionsList.map(
                                                                    (
                                                                        option
                                                                    ) => (
                                                                        <Select.Item
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </Select.Item>
                                                                    )
                                                                )}
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
                                                            <Label
                                                                size="small"
                                                                weight="plus"
                                                            >
                                                                Position
                                                            </Label>
                                                        </div>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(
                                                                value
                                                            ) => {
                                                                field.onChange(
                                                                    value
                                                                );
                                                                setSelectedPosition(
                                                                    value
                                                                );
                                                                const selected =
                                                                    cmsPositionsList.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            value
                                                                    );
                                                                setVisibleFormInputs(
                                                                    selected?.fields ||
                                                                        []
                                                                );
                                                            }}
                                                        >
                                                            <Select.Trigger>
                                                                <Select.Value placeholder="Select a position" />
                                                            </Select.Trigger>
                                                            <Select.Content className="max-h-fit">
                                                                {cmsPositionsList.map(
                                                                    (
                                                                        option
                                                                    ) => (
                                                                        <Select.Item
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </Select.Item>
                                                                    )
                                                                )}
                                                            </Select.Content>
                                                        </Select>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>

                                    {selectedPosition === "PAGE" && (
                                        <Controller
                                            control={form.control}
                                            name="page_type"
                                            render={({ field }) => {
                                                return (
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex items-center gap-x-1">
                                                            <Label
                                                                size="small"
                                                                weight="plus"
                                                            >
                                                                Page Type
                                                            </Label>
                                                        </div>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <Select.Trigger>
                                                                <Select.Value placeholder="Select page type" />
                                                            </Select.Trigger>
                                                            <Select.Content className="max-h-fit">
                                                                {pageTypesList.map(
                                                                    (
                                                                        option
                                                                    ) => (
                                                                        <Select.Item
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </Select.Item>
                                                                    )
                                                                )}
                                                            </Select.Content>
                                                        </Select>
                                                    </div>
                                                );
                                            }}
                                        />
                                    )}

                                    {isFieldVisible("title") && (
                                        <Controller
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => {
                                                return (
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex items-center gap-x-1">
                                                            <Label
                                                                size="small"
                                                                weight="plus"
                                                            >
                                                                Title
                                                            </Label>
                                                            <OptionalFormTag />
                                                        </div>
                                                        <Input
                                                            {...field}
                                                            value={
                                                                field.value ||
                                                                undefined
                                                            }
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
                                                            <Label
                                                                size="small"
                                                                weight="plus"
                                                            >
                                                                Sub Title
                                                            </Label>
                                                            <OptionalFormTag />
                                                        </div>
                                                        <Input
                                                            {...field}
                                                            value={
                                                                field.value ||
                                                                undefined
                                                            }
                                                        />
                                                    </div>
                                                );
                                            }}
                                        />
                                    )}

                                    {isFieldVisible("button") && (
                                        <div className="grid gap-y-4">
                                            <div className="flex items-center gap-x-1">
                                                <Label
                                                    size="small"
                                                    weight="plus"
                                                >
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
                                                                <Label
                                                                    size="small"
                                                                    weight="plus"
                                                                >
                                                                    Text
                                                                </Label>
                                                                <Input
                                                                    {...field}
                                                                    value={
                                                                        field.value ||
                                                                        undefined
                                                                    }
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
                                                                <Label
                                                                    size="small"
                                                                    weight="plus"
                                                                >
                                                                    Destination
                                                                </Label>
                                                                <Input
                                                                    {...field}
                                                                    value={
                                                                        field.value ||
                                                                        undefined
                                                                    }
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
                                                    <Label
                                                        size="small"
                                                        weight="plus"
                                                    >
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
                                                    <Label
                                                        size="small"
                                                        weight="plus"
                                                    >
                                                        Items
                                                    </Label>
                                                    <OptionalFormTag />
                                                </div>

                                                <Button
                                                    variant="secondary"
                                                    type="button"
                                                    onClick={() => {
                                                        const newKey =
                                                            Object.keys(
                                                                items
                                                            ).length.toString();
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
                                            {Object.values(items).map(
                                                (item, i) => (
                                                    <CMSFormItemsList
                                                        key={i}
                                                        item={item}
                                                        index={i}
                                                        setItems={setItems}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}

                                    {isFieldVisible("images") && (
                                        <>
                                            <Divider />
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex gap-x-1">
                                                    <Label
                                                        size="small"
                                                        weight="plus"
                                                    >
                                                        Images
                                                    </Label>
                                                    <OptionalFormTag />
                                                </div>
                                                <ImageCMSModule
                                                    images={images}
                                                    setImages={setImages}
                                                />
                                            </div>
                                        </>
                                    )}
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
