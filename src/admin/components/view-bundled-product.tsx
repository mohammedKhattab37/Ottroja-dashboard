import { Button, FocusModal, Heading, Badge, Text } from "@medusajs/ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../lib/sdk";
import { Eye } from "@medusajs/icons";
import { Link } from "react-router-dom";

interface ViewBundledProductProps {
    bundledProductId: string;
}

interface BundledProductDetails {
    id: string;
    title: string;
    product?: {
        id: string;
        title: string;
        status: string;
    };
    items: {
        id: string;
        quantity: number;
        product: {
            id: string;
            title: string;
            status: string;
        };
    }[];
}

export function ViewBundledProduct({
    bundledProductId,
}: ViewBundledProductProps) {
    const [open, setOpen] = useState(false);

    const { data: bundledProduct, isLoading } = useQuery<{
        bundled_product: BundledProductDetails;
    }>({
        queryKey: ["bundled-product", bundledProductId],
        queryFn: () =>
            sdk.client.fetch(`/admin/bundled-products/${bundledProductId}`, {
                method: "GET",
            }),
        enabled: open,
    });

    return (
        <FocusModal open={open} onOpenChange={setOpen}>
            <FocusModal.Trigger asChild>
                <Button variant="transparent" size="small">
                    <Eye className="h-4 w-4" />
                </Button>
            </FocusModal.Trigger>
            <FocusModal.Content>
                <FocusModal.Header>
                    <div className="flex items-center justify-end gap-x-2">
                        <Heading level={"h1"}>Bundle Details</Heading>
                    </div>
                </FocusModal.Header>
                <FocusModal.Body>
                    <div className="flex flex-1 flex-col items-center overflow-y-auto">
                        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-8 px-2 py-16">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Text>Loading...</Text>
                                </div>
                            ) : bundledProduct ? (
                                <>
                                    <div className="space-y-4">
                                        <div>
                                            <Text className="text-ui-fg-subtle font-medium">
                                                Bundle ID
                                            </Text>
                                            <Text className="font-mono text-sm">
                                                {
                                                    bundledProduct
                                                        .bundled_product.id
                                                }
                                            </Text>
                                        </div>

                                        <div>
                                            <Text className="text-ui-fg-subtle font-medium">
                                                Title
                                            </Text>
                                            <Heading level="h3">
                                                {
                                                    bundledProduct
                                                        .bundled_product.title
                                                }
                                            </Heading>
                                        </div>

                                        {bundledProduct.bundled_product
                                            .product && (
                                            <div>
                                                <Text className="text-ui-fg-subtle font-medium">
                                                    Linked Product
                                                </Text>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Link
                                                        to={`/products/${bundledProduct.bundled_product.product.id}`}
                                                        className="text-ui-fg-interactive hover:underline"
                                                    >
                                                        {
                                                            bundledProduct
                                                                .bundled_product
                                                                .product.title
                                                        }
                                                    </Link>
                                                    <Badge size="small">
                                                        {
                                                            bundledProduct
                                                                .bundled_product
                                                                .product.status
                                                        }
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Heading level="h3" className="mb-4">
                                            Bundle Items (
                                            {
                                                bundledProduct.bundled_product
                                                    .items.length
                                            }
                                            )
                                        </Heading>
                                        <div className="space-y-3">
                                            {bundledProduct.bundled_product.items.map(
                                                (item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-3 border rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                to={`/products/${item.product.id}`}
                                                                className="text-ui-fg-interactive hover:underline font-medium"
                                                            >
                                                                {
                                                                    item.product
                                                                        .title
                                                                }
                                                            </Link>
                                                            <Badge size="small">
                                                                {
                                                                    item.product
                                                                        .status
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Text className="text-ui-fg-subtle">
                                                                Qty:
                                                            </Text>
                                                            <Badge>
                                                                {item.quantity}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center py-8">
                                    <Text>Bundle not found</Text>
                                </div>
                            )}
                        </div>
                    </div>
                </FocusModal.Body>
                <FocusModal.Footer>
                    <div className="flex items-center justify-end gap-x-2">
                        <Button
                            variant="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </FocusModal.Footer>
            </FocusModal.Content>
        </FocusModal>
    );
}
