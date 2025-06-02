import {
    defineMiddlewares,
    authenticate,
    validateAndTransformBody,
    validateAndTransformQuery,
} from "@medusajs/framework/http";
import { GetAdminReviewsSchema } from "./admin/reviews/route";
import { PostStoreReviewSchema } from "./store/reviews/route";
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route";

export default defineMiddlewares({
    routes: [
        {
            method: ["POST"],
            matcher: "/store/reviews",
            middlewares: [
                authenticate("customer", ["session", "bearer"]),
                validateAndTransformBody(PostStoreReviewSchema),
            ],
        },
        {
            matcher: "/admin/reviews",
            method: ["GET"],
            middlewares: [
                validateAndTransformQuery(GetAdminReviewsSchema, {
                    isList: true,
                    defaults: [
                        "id",
                        "title",
                        "content",
                        "rating",
                        "product_id",
                        "customer_id",
                        "status",
                        "created_at",
                        "updated_at",
                        "product.*",
                    ],
                }),
            ],
        },
        {
            matcher: "/admin/reviews/status",
            method: ["POST"],
            middlewares: [
                validateAndTransformBody(PostAdminUpdateReviewsStatusSchema),
            ],
        },
    ],
});
