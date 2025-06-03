import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetAdminProductReviewsSchema = createFindParams();

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const { id } = req.params;
    const query = req.scope.resolve("query");

    try {
        const {
            data: reviews,
            metadata: { count, take, skip } = {
                count: 0,
                take: 20,
                skip: 0,
            },
        } = await query.graph({
            entity: "review",
            fields: ["*"],
            filters: {
                product_id: id,
            },
        });

        const reviewsArray = reviews || [];

        res.json({
            reviews: reviewsArray,
            count: reviewsArray.length,
            limit: take,
            offset: skip,
        });
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        res.status(500).json({
            message: "Error fetching reviews",
            error: error.message,
        });
    }
};
