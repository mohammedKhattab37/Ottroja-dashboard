import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { CreateReviewStep } from "./steps/create-review";

type CreateReviewInput = {
    title?: string;
    content: string;
    rating: number;
    product_id: string;
    customer_id?: string;
    first_name: string;
    last_name: string;
    status?: "pending" | "approved" | "rejected";
};

export const createReviewWorkflow = createWorkflow(
    "create-review",
    (input: CreateReviewInput) => {
        // Check product exists
        useQueryGraphStep({
            entity: "product",
            fields: ["id"],
            filters: {
                id: input.product_id,
            },
            options: {
                throwIfKeyNotFound: true,
            },
        });
        // Check customer exists
        useQueryGraphStep({
            entity: "customer",
            fields: ["id"],
            filters: {
                id: input.customer_id,
            },
            options: {
                throwIfKeyNotFound: true,
            },
        }).config({ name: "check-customer-exists" });

        // Create the review
        const review = CreateReviewStep(input);

        // @ts-ignore
        return new WorkflowResponse({
            review,
        });
    }
);
