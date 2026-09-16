import type { Product } from "@/types/product";
import { Package } from "lucide-react";

/**
 * Component to display product image(s) in the list
 * For simple products: shows the main image
 * For variable products: stacks the first 3 variant images with overlap
 */
export function ProductImageDisplay({ product }: { product: Product }) {
  if (product.type === "simple") {
    // Simple product - show main image or placeholder
    if (product.main_image_url) {
      return (
        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
          <img
            src={product.main_image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    // No image - show placeholder
    return (
      <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
        <Package className="h-8 w-8 text-gray-300" />
      </div>
    );
  }

  // Variable product - stack first 3 variant images
  const variantImages =
    product.variants
      ?.filter((v) => v.main_image_url)
      .map((v) => v.main_image_url!)
      .slice(0, 3) ?? [];

  if (variantImages.length === 0) {
    // No variant images - show placeholder
    return (
      <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
        <Package className="h-8 w-8 text-gray-300" />
      </div>
    );
  }

  // Stack images with absolute positioning for true overlap
  // Calculate total width: first image (48px) + remaining images (8px offset each)
  const totalWidth = 48 + (variantImages.length - 1) * 8;
  const remainingCount =
    (product.variants?.filter((v) => v.main_image_url).length ?? 0) - 3;

  return (
    <div className="flex items-center gap-2">
      {/* Stacked images container */}
      <div
        className="relative"
        style={{ width: `${totalWidth}px`, height: "48px" }}
      >
        {variantImages.map((imageUrl, index) => (
          <div
            key={index}
            className="absolute top-0 w-12 h-12 rounded border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
            style={{
              left: `${index * 8}px`,
              zIndex: variantImages.length - index,
            }}
          >
            <img
              src={imageUrl}
              alt={`${product.name} variant ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Show count badge if there are more than 3 variants with images */}
      {remainingCount > 0 && (
        <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
