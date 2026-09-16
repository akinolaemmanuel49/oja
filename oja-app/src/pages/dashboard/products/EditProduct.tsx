import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProduct } from "@/api/products/fetchProduct";
import { updateProduct } from "@/api/products/updateProduct";
import { AppLoader } from "@/components/loaders/AppLoader";
import type { ProductUpdate } from "@/types/product";
import { Button } from "@oja/ui";
import { ProductForm } from "./components/ProductForm";
import { AppHref } from "@/routes/constants";

export default function EditProduct() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["products", productId!],
    queryFn: fetchProduct,
    enabled: !!productId,
  });

  const mutation = useMutation({
    mutationFn: (data: ProductUpdate) => updateProduct(productId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate(AppHref.productsRoute);
    },
  });

  if (isLoading) return <AppLoader text="Loading product..." />;

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Product not found</p>
        <Button
          variant="outline"
          onClick={() => navigate(AppHref.productsRoute)}
          className="mt-4"
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      initialData={product}
      onSubmit={mutation.mutateAsync}
      isSubmitting={mutation.isPending}
      submitError={mutation.error as Error | null}
    />
  );
}
