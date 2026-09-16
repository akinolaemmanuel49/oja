import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Input,Card,CardContent,CardHeader,CardTitle,Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,Alert,AlertDescription } from "@oja/ui";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Loader2,
  Package,
} from "lucide-react";
import { fetchStorefront } from "@/api/storefronts/fetchStorefront";
import { fetchProducts } from "@/api/products/fetchProducts";
import { addProductToStorefront } from "@/api/storefronts/addProductToStorefront";
import { fetchStorefrontProducts } from "@/api/storefronts/fetchStorefrontProducts";
import { removeProductFromStorefront } from "@/api/storefronts/removeProductFromStorefront";
import { updateStorefrontProduct } from "@/api/storefronts/updateStorefrontProduct";
import { getVariantPriceRange } from "@/pages/dashboard/storefronts/helpers/getVariantPriceRange";
import { AppLoader } from "@/components/loaders/AppLoader";
import { getVariantSkuDisplay } from "./helpers/getVariantSkuDisplay";
import { StorefrontProductImageDisplay } from "./components/StorefrontProductImageDisplay";

/**
 * Main component for managing products within a storefront
 * Allows adding/removing products and adjusting their visibility/order
 */
export default function StorefrontProducts() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState<string | null>(null);

  // Fetch storefront details
  const { data: storefront } = useQuery({
    queryKey: ["storefronts", storeId!],
    queryFn: fetchStorefront,
    enabled: !!storeId,
  });

  // Fetch products already in this storefront
  const {
    data: storefrontProductsResponse,
    isLoading: isLoadingStorefrontProducts,
  } = useQuery({
    queryKey: ["storefront-products", storeId!, 1, 100],
    queryFn: fetchStorefrontProducts,
    enabled: !!storeId,
  });

  const storefrontProducts = useMemo(
    () => storefrontProductsResponse?.data ?? [],
    [storefrontProductsResponse],
  );

  // Fetch all available products (for the add dialog)
  const { data: allProductsResponse, isLoading: isLoadingAllProducts } =
    useQuery({
      queryKey: ["products", 1, 100],
      queryFn: fetchProducts,
      enabled: isAddDialogOpen,
    });

  const allProducts = useMemo(
    () => allProductsResponse?.data ?? [],
    [allProductsResponse],
  );

  // Get products that aren't already in the storefront
  const availableProducts = useMemo(() => {
    const existingProductIds = new Set(
      storefrontProducts.map((sp) => sp.product_id),
    );
    return allProducts.filter((p) => !existingProductIds.has(p.id));
  }, [allProducts, storefrontProducts]);

  // Filter displayed storefront products by search
  const filteredStorefrontProducts = useMemo(() => {
    if (!searchQuery.trim()) return storefrontProducts;

    const query = searchQuery.toLowerCase();
    return storefrontProducts.filter(
      (sp) =>
        sp.product_name.toLowerCase().includes(query) ||
        sp.sku?.toLowerCase().includes(query),
    );
  }, [storefrontProducts, searchQuery]);

  // Mutation: Add product to storefront
  const addProductMutation = useMutation({
    mutationFn: (productId: string) =>
      addProductToStorefront(storeId!, {
        product_id: productId,
        is_visible: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["storefront-products", storeId!],
      });
      setIsAddDialogOpen(false);
    },
  });

  // Mutation: Remove product from storefront
  const removeProductMutation = useMutation({
    mutationFn: (productId: string) =>
      removeProductFromStorefront(storeId!, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["storefront-products", storeId!],
      });
      setProductToRemove(null);
    },
  });

  // Mutation: Toggle product visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({
      productId,
      isVisible,
    }: {
      productId: string;
      isVisible: boolean;
    }) =>
      updateStorefrontProduct(storeId!, productId, {
        is_visible: !isVisible,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["storefront-products", storeId!],
      });
    },
  });

  const handleAddProduct = (productId: string) => {
    addProductMutation.mutate(productId);
  };

  const handleRemoveProduct = () => {
    if (productToRemove) {
      removeProductMutation.mutate(productToRemove);
    }
  };

  const handleToggleVisibility = (
    productId: string,
    currentVisibility: boolean,
  ) => {
    toggleVisibilityMutation.mutate({
      productId,
      isVisible: currentVisibility,
    });
  };

  if (isLoadingStorefrontProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading storefront products"} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/storefronts")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Storefronts
          </Button>
          <h1 className="text-3xl font-bold">
            {storefront?.name || "Storefront"} Products
          </h1>
          <p className="text-gray-600 mt-1">
            Manage which products appear in this storefront
          </p>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Products
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredStorefrontProducts.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {filteredStorefrontProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      SKU
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStorefrontProducts.map((sp) => (
                    <tr
                      key={sp.product_id}
                      className="border-b hover:bg-gray-50"
                    >
                      {/* Product Image(s) */}
                      <td className="py-3 px-4">
                        <StorefrontProductImageDisplay product={sp} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {sp.product_type === "variable" ? "Variable" : "Simple"}
                        </span>
                      </td>
                      {/* SKU / Variants Column - Different display for simple vs variable */}
                      <td className="py-3 px-4">{getVariantSkuDisplay(sp)}</td>
                      {/* Price Column - Shows range for variable products */}
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {getVariantPriceRange(sp)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            sp.is_visible
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {sp.is_visible ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleVisibility(
                                sp.product_id,
                                sp.is_visible,
                              )
                            }
                            title={
                              sp.is_visible ? "Hide product" : "Show product"
                            }
                          >
                            {sp.is_visible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setProductToRemove(sp.product_id)}
                            title="Remove from storefront"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "No products match your search"
                  : "No products in this storefront"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Add Products to Storefront</DialogTitle>
            <DialogDescription>
              Select products to add to {storefront?.name}
            </DialogDescription>
          </DialogHeader>

          {addProductMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {addProductMutation.error instanceof Error
                  ? addProductMutation.error.message
                  : "Failed to add product"}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {isLoadingAllProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : availableProducts.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.type === "simple"
                          ? `SKU: ${product.sku || "N/A"}`
                          : `${product.variants?.length || 0} variants`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddProduct(product.id)}
                      disabled={addProductMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                All products are already in this storefront
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!productToRemove}
        onOpenChange={() => setProductToRemove(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the product from this storefront. The product
              itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
