import {
    defineMiddlewares,
    authenticate,
    validateAndTransformBody,
    validateAndTransformQuery,
} from "@medusajs/framework/http";
import { GetAdminReviewsSchema } from "./admin/reviews/route";
import { PostStoreReviewSchema } from "./store/reviews/route";
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route";
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route";
import { PostBundledProductsSchema } from "./admin/bundled-products/route";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { PostCartsBundledLineItemsSchema } from "./store/carts/[id]/line-item-bundles/route";
import { PutBundledProductSchema } from "./admin/bundled-products/[id]/route";

export default defineMiddlewares({
    routes: [
        {
            matcher: "/store/reviews",
            method: ["POST"],
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
        {
            matcher: "/store/products/:id/reviews",
            methods: ["GET"],
            middlewares: [
                validateAndTransformQuery(GetStoreReviewsSchema, {
                    isList: true,
                    defaults: [
                        "id",
                        "rating",
                        "title",
                        "first_name",
                        "last_name",
                        "content",
                        "created_at",
                    ],
                }),
            ],
        },
        {
            matcher: "/admin/bundled-products",
            methods: ["POST"],
            middlewares: [validateAndTransformBody(PostBundledProductsSchema)],
        },
        {
            matcher: "/admin/bundled-products",
            methods: ["GET"],
            middlewares: [
                validateAndTransformQuery(createFindParams(), {
                    defaults: [
                        "id",
                        "title",
                        "product.*",
                        "items.*",
                        "items.product.*",
                    ],
                    isList: true,
                    defaultLimit: 15,
                }),
            ],
        },
        {
            matcher: "/store/carts/:id/line-item-bundles",
            methods: ["POST"],
            middlewares: [
                validateAndTransformBody(PostCartsBundledLineItemsSchema),
            ],
        },
        {
            matcher: "/admin/bundled-products/:id",
            methods: ["GET"],
            middlewares: [
                validateAndTransformQuery(createFindParams(), {
                    defaults: [
                        "id",
                        "title",
                        "product.*",
                        "items.*",
                        "items.product.*",
                    ],
                }),
            ],
        },
        {
            matcher: "/admin/bundled-products/:id",
            methods: ["PUT"],
            middlewares: [validateAndTransformBody(PutBundledProductSchema)],
        },
    ],
});
