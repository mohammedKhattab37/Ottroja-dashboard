import { Button, Prompt, toast } from "@medusajs/ui";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../lib/sdk";
import { Trash } from "@medusajs/icons";

interface DeleteBundledProductProps {
    bundledProduct: {
        id: string;
        title: string;
    };
}

export function DeleteBundledProduct({
    bundledProduct,
}: DeleteBundledProductProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { mutateAsync: deleteBundledProduct, isPending: isDeleting } =
        useMutation({
            mutationFn: async () => {
                await sdk.client.fetch(
                    `/admin/bundled-products/${bundledProduct.id}`,
                    {
                        method: "DELETE",
                    }
                );
            },
        });

    const handleDelete = async () => {
        try {
            await deleteBundledProduct();
            setOpen(false);
            toast.success("Bundled product deleted successfully");
            queryClient.invalidateQueries({
                queryKey: ["bundled-products"],
            });
        } catch (error) {
            toast.error("Failed to delete bundled product");
        }
    };

    return (
        <Prompt open={open} onOpenChange={setOpen}>
            <Prompt.Trigger asChild>
                <Button variant="transparent" size="small">
                    <Trash className="h-4 w-4" />
                </Button>
            </Prompt.Trigger>
            <Prompt.Content>
                <Prompt.Header>
                    <Prompt.Title>Delete Bundled Product</Prompt.Title>
                    <Prompt.Description>
                        Are you sure you want to delete "{bundledProduct.title}
                        "? This action cannot be undone.
                    </Prompt.Description>
                </Prompt.Header>
                <Prompt.Footer>
                    <Prompt.Cancel>Cancel</Prompt.Cancel>
                    <Prompt.Action onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Prompt.Action>
                </Prompt.Footer>
            </Prompt.Content>
        </Prompt>
    );
}
