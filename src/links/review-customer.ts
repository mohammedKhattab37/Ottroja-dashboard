import { defineLink } from "@medusajs/framework/utils";
import CustomerModule from "@medusajs/medusa/customer";
import ProductReviewModule from "../modules/product-review";

export default defineLink(
    {
        linkable: ProductReviewModule.linkable.review,
        field: "customer_id",
        isList: false,
    },
    CustomerModule.linkable.customer,
    {
        readOnly: true,
    }
);
