import type { StorefrontProduct } from "@/types/storefront.product";

/**
 * Helper function to format the SKU column for variable products
 * Shows the variant count and indicates it's a variable product
 */
export function getVariantSkuDisplay(
  product: StorefrontProduct,
): React.ReactNode {
  if (product.product_type === "simple") {
    return <span className="text-gray-600">{product.sku || "—"}</span>;
  }

  // For variable products, show variant count
  const variantCount = product.variants?.length || 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-600 text-sm">
        {variantCount} {variantCount === 1 ? "variant" : "variants"}
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        Variable
      </span>
    </div>
  );
}
