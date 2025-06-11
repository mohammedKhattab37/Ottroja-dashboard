import { Button, FocusModal, Heading, Input, Label, toast } from "@medusajs/ui";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../lib/sdk";
import { PencilSquare } from "@medusajs/icons";

interface EditBundledProductProps {
    bundledProduct: {
        id: string;
        title: string;
    };
}

export function EditBundledProduct({
    bundledProduct,
}: EditBundledProductProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(bundledProduct.title);
    const queryClient = useQueryClient();

    const { mutateAsync: updateBundledProduct, isPending: isUpdating } =
        useMutation({
            mutationFn: async (data: { title: string }) => {
                await sdk.client.fetch(
                    `/admin/bundled-products/${bundledProduct.id}`,
                    {
                        method: "PUT",
                        body: data,
                    }
                );
            },
        });

    const handleUpdate = async () => {
        try {
            await updateBundledProduct({ title });
            setOpen(false);
            toast.success("Bundled product updated successfully");
            queryClient.invalidateQueries({
                queryKey: ["bundled-products"],
            });
        } catch (error) {
            toast.error("Failed to update bundled product");
        }
    };

    return (
        <FocusModal open={open} onOpenChange={setOpen}>
            <FocusModal.Trigger asChild>
                <Button variant="transparent" size="small">
                    <PencilSquare className="h-4 w-4" />
                </Button>
            </FocusModal.Trigger>
            <FocusModal.Content>
                <FocusModal.Header>
                    <div className="flex items-center justify-end gap-x-2">
                        <Heading level={"h1"}>Edit Bundled Product</Heading>
                    </div>
                </FocusModal.Header>
                <FocusModal.Body>
                    <div className="flex flex-1 flex-col items-center overflow-y-auto">
                        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-8 px-2 py-16">
                            <div>
                                <Label>Bundle Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter bundle title"
                                />
                            </div>
                        </div>
                    </div>
                </FocusModal.Body>
                <FocusModal.Footer>
                    <div className="flex items-center justify-end gap-x-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setOpen(false);
                                setTitle(bundledProduct.title); // Reset on cancel
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdate}
                            isLoading={isUpdating}
                            disabled={!title.trim()}
                        >
                            Update Bundle
                        </Button>
                    </div>
                </FocusModal.Footer>
            </FocusModal.Content>
        </FocusModal>
    );
}
