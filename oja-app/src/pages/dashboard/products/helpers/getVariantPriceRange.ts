import type { Product } from "@/types/product";

/**
 * Helper function to calculate the price range for variable products
 * Returns a formatted string like "₦1,000 - ₦5,000" or just "₦1,000" if all variants have the same price
 */
export function getVariantPriceRange(product: Product): string {
  // For simple products, return the base price
  if (product.type === "simple") {
    return product.base_price ? `₦${product.base_price.toLocaleString()}` : "—";
  }

  // For variable products, calculate range from variants
  if (!product.variants || product.variants.length === 0) {
    return "—";
  }

  // Extract all non-null prices from variants
  const prices = product.variants
    .map((v) => v.price)
    .filter((p): p is number => p !== null && p !== undefined);

  if (prices.length === 0) {
    return "—";
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // If all variants have the same price, just show one value
  if (minPrice === maxPrice) {
    return `₦${minPrice.toLocaleString()}`;
  }

  // Otherwise show the range
  return `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`;
}
