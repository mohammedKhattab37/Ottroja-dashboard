import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { z } from "zod";
import {
    updateBundledProductWorkflow,
    UpdateBundledProductWorkflowInput,
} from "../../../../workflows/update-bundled-product";
import {
    deleteBundledProductWorkflow,
    DeleteBundledProductWorkflowInput,
} from "../../../../workflows/delete-bundled-product";

export const PutBundledProductSchema = z.object({
    title: z.string().optional(),
});

type PutBundledProductSchema = z.infer<typeof PutBundledProductSchema>;

export async function GET(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) {
    const query = req.scope.resolve("query");
    const { id } = req.params;

    const { data: bundledProduct } = await query.graph({
        entity: "bundle",
        filters: { id },
        fields: ["id", "title", "product.*", "items.*", "items.product.*"],
    });

    if (!bundledProduct?.length) {
        return res.status(404).json({
            message: "Bundled product not found",
        });
    }

    res.json({
        bundled_product: bundledProduct[0],
    });
}

export async function PUT(
    req: AuthenticatedMedusaRequest<PutBundledProductSchema>,
    res: MedusaResponse
) {
    const { id } = req.params;

    const { result: bundledProduct } = await updateBundledProductWorkflow(
        req.scope
    ).run({
        input: {
            id,
            bundle: req.validatedBody,
        } as UpdateBundledProductWorkflowInput,
    });

    res.json({
        bundled_product: bundledProduct,
    });
}

export async function DELETE(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params;

    await deleteBundledProductWorkflow(req.scope).run({
        input: {
            id,
        } as DeleteBundledProductWorkflowInput,
    });

    res.status(200).json({
        id,
        object: "bundled_product",
        deleted: true,
    });
}
