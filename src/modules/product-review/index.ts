import { Module } from "@medusajs/framework/utils";
import ProductReviewModuleService from "./service";
import Review from "./models/review";

export const PRODUCT_REVIEW_MODULE = "productReview";

export default Module(PRODUCT_REVIEW_MODULE, {
    service: ProductReviewModuleService,
});

export const linkable = {
    review: Review,
};
