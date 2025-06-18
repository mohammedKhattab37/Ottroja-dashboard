import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../modules/cms";
import { deleteCMSItemWorkflow } from "../../../../workflows/delete-cms-item";
import { cmsItemSchema } from "../validators";
import { updateCMSItemWorkflow } from "../../../../workflows/update-cms-item";
import { deleteFilesWorkflow } from "@medusajs/medusa/core-flows";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { itemId } = req.params;

  const cmsService = req.scope.resolve(CMS_MODULE);
  const cmsItem = await cmsService.listCMSItems({ id: itemId });

  res.json({
    cms_item: cmsItem[0],
  });
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { itemId } = req.params;
  const input = cmsItemSchema.parse(req.body);

  const { result } = await updateCMSItemWorkflow(req.scope).run({
    input: {
      ...input,
      id: itemId,
      items: input.items || {},
      images: input.images || [],
    },
  });

  res.json(result);
};

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { itemId } = req.params;
  const deletedItem = await deleteCMSItemWorkflow(req.scope).run({
    input: itemId,
  });

  if (deletedItem && deletedItem.result.item.images) {
    await deleteFilesWorkflow(req.scope).run({
      input: { ids: deletedItem.result.item.images },
    });
  }

  res.json({ message: "CMS: deleted successfully" });
}
