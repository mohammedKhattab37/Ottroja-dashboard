import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import ReviewDataTable from "./table/data-table";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { sdk } from "../../lib/sdk";
import { useQuery } from "@tanstack/react-query";

export type Review = {
    id: string;
    title?: string;
    content: string;
    rating: number;
    first_name: string;
    last_name: string;
    product_id: string;
    customer_id?: string;
    status: "pending" | "approved" | "rejected";
    created_at: Date;
    updated_at: Date;
};

export const ProductReviewsWidget = ({
    data,
}: DetailWidgetProps<AdminProduct>) => {
    const {
        data: reviewsResponse,
        isLoading,
        error,
        refetch,
    } = useQuery<{
        reviews: Review[];
        count: number;
        limit: number;
        offset: number;
    }>({
        queryFn: () =>
            sdk.client.fetch(`/admin/products/${data.id}/reviews`, {
                method: "GET",
            }) as Promise<{
                reviews: Review[];
                count: number;
                limit: number;
                offset: number;
            }>,
        queryKey: ["product-reviews", data.id],
    });

    const reviews = reviewsResponse?.reviews || [];

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between p-4">
                <Heading level="h2">
                    Product Reviews ({reviewsResponse?.count || 0})
                </Heading>
                {error && (
                    <div className="text-red-500 text-sm">
                        Error:{" "}
                        {error instanceof Error
                            ? error.message
                            : "Unknown error"}
                    </div>
                )}
            </div>
            <ReviewDataTable
                data={reviews}
                refetch={refetch}
                isLoading={isLoading}
            />
        </Container>
    );
};

export const config = defineWidgetConfig({
    zone: "product.details.after",
});

export default ProductReviewsWidget;
