import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Card,CardContent,CardDescription,CardHeader,CardTitle,Alert,AlertDescription } from "@oja/ui";
import { ArrowLeft, Edit, Package, Loader2 } from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchProduct } from "@/api/products/fetchProduct";

/**
 * Product Detail View Component
 * Displays comprehensive information about a single product
 * Handles images differently for simple vs variable products
 */
export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", productId!],
    queryFn: fetchProduct,
    enabled: !!productId && can("products:read"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Product not found or access denied"}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate("/products")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600 mt-2">
              {product.description || "No description"}
            </p>
          </div>

          <PermissionGuard permission="products:update">
            <Button onClick={() => navigate(`/products/${product.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Two-column layout for simple products */}
      {product.type === "simple" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Product Type
                </label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 capitalize">
                    {product.type}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">SKU</label>
                <p className="mt-1 text-gray-900">{product.sku || "Not set"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Base Price
                </label>
                <p className="mt-1 text-gray-900 text-lg font-semibold">
                  {product.base_price
                    ? `₦${product.base_price.toLocaleString()}`
                    : "Not set"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Stock Quantity
                </label>
                <p className="mt-1 text-gray-900">
                  {product.stock_quantity ?? "Not tracked"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Re-order Level
                </label>
                <p className="mt-1 text-gray-900">
                  {product.re_order_level ?? "Not set"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Created
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(product.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Updated
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Image Card (Simple Product) */}
          {product.main_image_url ? (
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Image */}
                <div>
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="w-full h-auto rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Main Image
                  </p>
                </div>

                {/* Additional Images */}
                {product.image_urls && product.image_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <Package className="h-16 w-16 text-gray-300" />
                </div>
                <p className="text-center text-gray-500 mt-4 text-sm">
                  No image available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* For variable products - show basic info first, then variants */}
      {product.type === "variable" && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Product Type
                </label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 capitalize">
                    {product.type}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Created
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(product.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Updated
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Variants Card */}
          {product.variants && product.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  {product.variants.length}{" "}
                  {product.variants.length === 1 ? "variant" : "variants"}{" "}
                  configured
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {product.variants.map((variant) => (
                  <Card key={variant.id} className="overflow-hidden">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Left side - Variant details */}
                      <div className="p-6">
                        <h4 className="font-semibold text-lg mb-4">
                          {variant.sku || "No SKU"}
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Attributes
                            </label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(variant.attributes || {}).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                                  >
                                    {key}: {value}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Price
                            </label>
                            <p className="mt-1 text-gray-900 text-lg font-semibold">
                              {variant.price
                                ? `₦${variant.price.toLocaleString()}`
                                : "—"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Stock
                              </label>
                              <p className="mt-1 text-gray-900">
                                {variant.stock_quantity ?? 0}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Re-order Level
                              </label>
                              <p className="mt-1 text-gray-900">
                                {variant.re_order_level ?? 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Variant images */}
                      <div className="bg-gray-50 p-6">
                        {variant.main_image_url ? (
                          <div className="space-y-3">
                            <div>
                              <img
                                src={variant.main_image_url}
                                alt={`Variant ${variant.sku}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                Main Image
                              </p>
                            </div>

                            {variant.image_urls &&
                              variant.image_urls.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {variant.image_urls.map((url, index) => (
                                    <img
                                      key={index}
                                      src={url}
                                      alt={`Variant ${variant.sku} - ${index + 1}`}
                                      className="w-full h-20 object-cover rounded"
                                    />
                                  ))}
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-48 bg-white rounded-lg border-2 border-dashed border-gray-200">
                            <div className="text-center">
                              <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No images</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
