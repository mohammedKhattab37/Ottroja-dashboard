import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import ProductReviewModuleService from "../modules/product-review/service"

export default async function productDeletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = data.id

  try {
    // Resolve the product review service
    const productReviewService: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    // Get all reviews for this product
    const reviews = await productReviewService.listReviews({
      product_id: productId,
    })

    if (reviews.length > 0) {
      // Delete all reviews for this product
      const reviewIds = reviews.map(review => review.id)
      await productReviewService.deleteReviews(reviewIds)
      
      console.log(`Deleted ${reviews.length} reviews for product ${productId}`)
    }
  } catch (error) {
    console.error(`Failed to delete reviews for product ${productId}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "product.deleted",
} 